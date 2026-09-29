import { describe, expect, it } from "vitest";
import {
  beyannameOzeti,
  bosVeri,
  ekListesi,
  hisseOku,
  mirasciTuru,
  veriyiTamamla,
  yeniBorc,
  yeniKalem,
  yeniMirasci,
  yeniTasinmaz,
  type BeyannameVerisi,
} from "@/lib/beyanname/hesap";
import { beyannameIcerikYukle } from "@/lib/beyanname/yukle";
import { kodNormalle, kodOzeti, kodUrunleri, kodlariYukle } from "@/lib/erisim";
import { icerikYukle } from "@/lib/icerik/yukle";

const p = icerikYukle().parametreler;
const icerik = beyannameIcerikYukle();

function ornek(): BeyannameVerisi {
  const v = bosVeri();
  v.payda = "4";
  v.mirascilar = [
    { ...yeniMirasci(), ad: "Eş", yakinlik: "es", pay: "1" },
    { ...yeniMirasci(), ad: "Çocuk 1", yakinlik: "cocuk", pay: "3" },
  ];
  v.tasinmazlar = [{ ...yeniTasinmaz(), ilce: "Kadıköy", hisse: "1/2", deger: "4.000.000" }];
  v.digerleri = [{ ...yeniKalem("banka"), aciklama: "Vadesiz", deger: "1.000.000" }];
  v.borclar = [{ ...yeniBorc("belgeli_borc"), aciklama: "Kredi", tutar: "200.000" }];
  return v;
}

describe("beyanname hesapları", () => {
  it("hisse yazımlarını okur", () => {
    expect(hisseOku("")).toBe(1);
    expect(hisseOku("1/2")).toBe(0.5);
    expect(hisseOku(" 3 / 8 ")).toBe(0.375);
    expect(hisseOku("5/4")).toBeNull();
    expect(hisseOku("yarım")).toBeNull();
  });

  it("taşınmazda hisse uygulanır, borçlar düşülür, paylar bölünür", () => {
    const o = beyannameOzeti(ornek(), p);
    expect(o.tasinmazToplami).toBe(2_000_000);
    expect(o.brut).toBe(3_000_000);
    expect(o.net).toBe(2_800_000);
    expect(o.mirascilar.map((m) => m.tutar)).toEqual([700_000, 2_100_000]);
    // İkisi de istisna altında kalır
    expect(o.toplamVergi).toBe(0);
    expect(o.payToplami).toBe(4);
  });

  it("çocuk varsa eş çocuklu istisnasını alır, yoksa çocuksuz", () => {
    const v = ornek();
    expect(mirasciTuru(v.mirascilar[0], v.mirascilar)).toBe("es_cocuklu");
    expect(mirasciTuru(v.mirascilar[0], [v.mirascilar[0]])).toBe("es_cocuksuz");
  });

  it("boş tutarlar eksik sayılır", () => {
    const v = ornek();
    v.digerleri.push(yeniKalem("arac"));
    expect(beyannameOzeti(v, p).eksikDeger).toBe(1);
    // Değeri yazılmayan hak eksik sayılmaz (VİVK m.10/g)
    v.digerleri.push(yeniKalem("hak"));
    expect(beyannameOzeti(v, p).eksikDeger).toBe(1);
  });

  it("ek listesi varlıklara göre oluşur", () => {
    const ekler = ekListesi(ornek(), icerik);
    expect(ekler[0].ad).toMatch(/Mirasçılık belgesi/);
    expect(ekler.some((e) => /emlak vergisi/i.test(e.ad))).toBe(true);
    expect(ekler.some((e) => /bakiye/i.test(e.ad))).toBe(true);
    expect(ekler.some((e) => /borç/i.test(e.ad))).toBe(true);
    expect(new Set(ekler.map((e) => e.id)).size).toBe(ekler.length);
  });
});

describe("eski kayıtların taşınması", () => {
  it("sürüm 1 verisi eksiksiz sürüm 2'ye tamamlanır", () => {
    const eski = {
      surum: 1,
      muris: { ad: "Mehmet Yılmaz", vefat_tarihi: "2026-08-10", ikamet: "Kadıköy, İstanbul" },
      payda: "8",
      mirascilar: [{ id: "m", ad: "Ayşe", yakinlik: "es", pay: "2" }],
      tasinmazlar: [{ id: "t", tur: "konut", konum: "Moda", hisse: "", deger: "100" }],
      haklar: [{ id: "h", aciklama: "telif" }],
      digerleri: [],
      borclar: [],
      hazirEkler: ["sabit:0"],
    };
    const v = veriyiTamamla(eski);
    expect(v.surum).toBe(2);
    expect(v.muris.il_ilce).toBe("Kadıköy, İstanbul");
    expect(v.muris.baba_adi).toBe("");
    expect(v.mirascilar[0]).toMatchObject({ ad: "Ayşe", tc: "", adres_tel: "" });
    expect(v.tasinmazlar[0].mahalle).toBe("Moda");
    expect(v.hazirEkler).toEqual(["sabit:0"]);
  });

  it("bozuk veri boş veriye döner", () => {
    expect(veriyiTamamla(null)).toEqual(bosVeri());
    expect(veriyiTamamla({ mirascilar: "x" }).mirascilar).toEqual([]);
  });
});

describe("erişim kodları", () => {
  it("normalleştirme yazım farklarını yok sayar", () => {
    expect(kodNormalle("vr-abcd-efgh 2345")).toBe("VRABCDEFGH2345");
    expect(kodOzeti("vr-abcd-efgh-2345")).toBe(kodOzeti("VRABCDEFGH2345"));
  });

  it("listede olmayan ya da kısa kod reddedilir", () => {
    const kodlar = [{ ozet: kodOzeti("VR-TEST-TEST-TEST"), urunler: ["beyanname" as const] }];
    expect(kodUrunleri("vr test test test", kodlar)).toEqual(["beyanname"]);
    expect(kodUrunleri("VR-TEST-TEST-TESX", kodlar)).toEqual([]);
    expect(kodUrunleri("VR", kodlar)).toEqual([]);
  });

  it("kod dosyası geçerli", () => {
    expect(Array.isArray(kodlariYukle())).toBe(true);
  });
});
