import { beforeEach, describe, expect, it, vi } from "vitest";
import { bosVeri, yeniMirasci } from "@/lib/beyanname/hesap";
import { kaliciNumaraVar, kimlikAyir, kimlikBirlestir } from "@/lib/beyanname/kimlik";
import { HAREKETSIZ_SILME_GUN, suresiDoldu } from "@/lib/depo";
import { jsonLdMetni } from "@/lib/jsonld";
import { UMAMI_BETIK_AYARLARI } from "@/lib/marka";
import { baskaSitedenMi, istemciIp, jsonGovde } from "@/lib/sunucu/guvenlik";

// Sahte Redis: SET NX davranışını taklit eder, hangi komutların çağrıldığını kaydeder. Ağ yok.
const redisKayit = vi.hoisted(() => ({ veri: new Map<string, string>(), komutlar: [] as string[], setSecenekleri: [] as unknown[] }));
vi.mock("@upstash/redis", () => ({
  Redis: class {
    async set(k: string, v: string, o?: { nx?: boolean; ex?: number }) {
      redisKayit.komutlar.push("set");
      redisKayit.setSecenekleri.push(o);
      if (o?.nx && redisKayit.veri.has(k)) return null;
      redisKayit.veri.set(k, v);
      return "OK";
    }
    async hset() {
      redisKayit.komutlar.push("hset");
    }
    async expire() {
      redisKayit.komutlar.push("expire");
    }
  },
}));
// Sahte hız sınırlayıcı: izin verilecek istek sayısı testte ayarlanır.
const hiz = vi.hoisted(() => ({ kalan: 100 }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      async limit() {
        hiz.kalan -= 1;
        return { success: hiz.kalan >= 0, reset: Date.now() + 60_000 };
      }
    },
    { slidingWindow: () => ({}) },
  ),
}));
const cerezler = vi.hoisted(() => ({ yazilan: [] as string[] }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: (ad: string) => cerezler.yazilan.push(ad), get: () => undefined }) }));

const ADRES = "https://vefatrehberi.com/api/erisim";
function istek(govde: unknown, basliklar: Record<string, string> = {}, url = ADRES) {
  const metin = typeof govde === "string" ? govde : JSON.stringify(govde);
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://vefatrehberi.com", "x-real-ip": "203.0.113.7", ...basliklar },
    body: metin,
  });
}

describe("analitik: paylaşım linkindeki cevaplar Umami'ye gitmez", () => {
  it("Umami betiği adresin # ve ? kısımlarını çıkaracak şekilde ayarlı", () => {
    expect(UMAMI_BETIK_AYARLARI["data-exclude-hash"]).toBe("true");
    expect(UMAMI_BETIK_AYARLARI["data-exclude-search"]).toBe("true");
  });
});

describe("JSON-LD gömme", () => {
  it("</script> içeren metin betik etiketini kapatamaz, JSON anlamı korunur", () => {
    const veri = { soru: "</script><script>alert(1)</script>" };
    const metin = jsonLdMetni(veri);
    expect(metin).not.toContain("<");
    expect(metin).toContain("\\u003c/script>");
    expect(JSON.parse(metin)).toEqual(veri);
  });
});

describe("beyanname: T.C. kimlik numaraları kalıcı depoya yazılmaz", () => {
  it("ayır ve birleştir: kalıcı kısımda numara kalmaz, birleşince geri gelir", () => {
    const v = bosVeri();
    v.muris.tc = "10000000146";
    const m = { ...yeniMirasci(), tc: "20000000246", ad: "Deneme" };
    v.mirascilar.push(m);
    const { saklanacak, kimlik } = kimlikAyir(v);
    expect(JSON.stringify(saklanacak)).not.toMatch(/10000000146|20000000246/);
    expect(kaliciNumaraVar(saklanacak)).toBe(false);
    expect(kaliciNumaraVar(v)).toBe(true);
    expect(kimlikBirlestir(saklanacak, kimlik)).toEqual(v);
  });

  it("uzun süre kullanılmayan cihazdaki veriler silinir", () => {
    const gun = 24 * 60 * 60 * 1000;
    const simdi = Date.UTC(2026, 8, 29);
    expect(suresiDoldu(String(simdi - (HAREKETSIZ_SILME_GUN + 1) * gun), simdi)).toBe(true);
    expect(suresiDoldu(String(simdi - 10 * gun), simdi)).toBe(false);
    expect(suresiDoldu(null, simdi)).toBe(false);
  });
});

describe("istek korumaları", () => {
  it("başka siteden gelen tarayıcı isteği tanınır", () => {
    expect(baskaSitedenMi(istek({}, { origin: "https://kotu.example" }))).toBe(true);
    expect(baskaSitedenMi(istek({}, { "sec-fetch-site": "cross-site" }))).toBe(true);
    expect(baskaSitedenMi(istek({}))).toBe(false);
  });

  it("gövde boyutu ve türü sınırlanır", async () => {
    const buyuk = await jsonGovde(istek("x".repeat(5000)));
    expect("yanit" in buyuk && buyuk.yanit.status).toBe(413);
    const tur = await jsonGovde(istek("{}", { "content-type": "text/plain" }));
    expect("yanit" in tur && tur.yanit.status).toBe(415);
    const bozuk = await jsonGovde(istek("{bozuk"));
    expect("yanit" in bozuk && bozuk.yanit.status).toBe(400);
  });

  it("istemci IP'si Vercel başlığından okunur", () => {
    expect(istemciIp(istek({}))).toBe("203.0.113.7");
    expect(istemciIp(istek({}, { "x-real-ip": "", "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe("198.51.100.2");
  });
});

describe("erişim kodu (/api/erisim)", () => {
  beforeEach(() => {
    process.env.KV_REST_API_URL = "https://sahte.upstash.io";
    process.env.KV_REST_API_TOKEN = "sahte";
    cerezler.yazilan = [];
  });

  it("paralel denemeler hız sınırına takılır", async () => {
    const { POST } = await import("@/app/api/erisim/route");
    hiz.kalan = 2;
    const yanitlar = await Promise.all(Array.from({ length: 4 }, () => POST(istek({ kod: "YANLIS-KOD-0000" }))));
    const durumlar = yanitlar.map((y) => y.status).sort();
    expect(durumlar).toEqual([403, 403, 429, 429]);
    expect(cerezler.yazilan).toEqual([]);
  });
});
