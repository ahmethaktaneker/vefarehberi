import { z } from "zod";
import { epostaTemizle } from "@/lib/eposta";
import { kvkkYukle } from "@/lib/kvkk";
import { baskaSitedenMi, hizSiniri, jsonGovde, redisBaglantisi } from "@/lib/sunucu/guvenlik";

/**
 * Yeni özelliklerden haber almak için e-posta bırakma. Yalnızca e-posta, ilgilenilen konu, tarih ve
 * rıza sürümü saklanır. Kayıt 12 ay sonra kendiliğinden silinir (aydınlatma metni).
 *
 * Kayıt tek bir SET ... NX EX komutuyla yazılır: süresiz kayıt kalamaz ve var olan bir kaydın (ilk
 * rızanın tarihi ve sürümü) üzerine başkası yazamaz. Adres zaten kayıtlıysa da aynı başarılı yanıt
 * döner; böylece bir adresin kayıtlı olup olmadığı bu uçtan öğrenilemez.
 */

const SAKLAMA_SN = 60 * 60 * 24 * 365;

const Istek = z.strictObject({
  eposta: z.string().max(254),
  paket: z.enum(["beyanname", "aile", "yenilikler"]),
  riza: z.literal(true),
  riza_surumu: z.string().max(40),
  site: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  if (baskaSitedenMi(request)) return Response.json({ hata: "kaynak" }, { status: 403 });
  const govdeSonucu = await jsonGovde(request);
  if ("yanit" in govdeSonucu) return govdeSonucu.yanit;
  const govde = Istek.safeParse(govdeSonucu.veri);
  if (!govde.success) return Response.json({ hata: "gecersiz" }, { status: 400 });
  const { eposta, paket, riza_surumu, site } = govde.data;

  // Bot tuzağı: sessizce başarılı görün.
  if (site) return Response.json({ tamam: true });

  const temiz = epostaTemizle(eposta);
  if (!temiz) return Response.json({ hata: "eposta" }, { status: 400 });
  if (riza_surumu !== kvkkYukle().acik_riza.paket_ilgi.surum) return Response.json({ hata: "riza" }, { status: 400 });

  const db = redisBaglantisi();
  if (!db) return Response.json({ hata: "hazir_degil" }, { status: 503 });

  try {
    const sinir = await hizSiniri(request, "paket-ilgi", 5, "10 m");
    if (sinir) return sinir;
    await db.set(`paket_ilgi:${temiz}`, JSON.stringify({ paket, tarih: new Date().toISOString(), riza_surumu }), {
      nx: true,
      ex: SAKLAMA_SN,
    });
  } catch {
    return Response.json({ hata: "gecici" }, { status: 503 });
  }
  return Response.json({ tamam: true });
}
