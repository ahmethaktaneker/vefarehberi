import { describe, expect, it } from "vitest";
import { beyannameOzeti, bosVeri, ekListesi, hisseOku, mirasciTuru, type BeyannameVerisi } from "@/lib/beyanname/hesap";
import { beyannameIcerikYukle } from "@/lib/beyanname/yukle";
import { kodNormalle, kodOzeti, kodUrunleri, kodlariYukle } from "@/lib/erisim";
import { icerikYukle } from "@/lib/icerik/yukle";

const p = icerikYukle().parametreler;
const icerik = beyannameIcerikYukle();

function ornek(): BeyannameVerisi {
  const v = bosVeri();
  v.payda = "4";
  v.mirascilar = [
    { id: "e", ad: "Eş", yakinlik: "es", pay: "1" },
    { id: "c1", ad: "Çocuk 1", yakinlik: "cocuk", pay: "3" },
  ];
  v.tasinmazlar = [{ id: "t", tur: "konut", konum: "Kadıköy", hisse: "1/2", deger: "4.000.000" }];
  v.digerleri = [{ id: "b", tur: "banka", aciklama: "Vadesiz", deger: "1.000.000" }];
  v.borclar = [{ id: "k", tur: "belgeli_borc", aciklama: "Kredi", tutar: "200.000" }];
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
    v.digerleri.push({ id: "a", tur: "arac", aciklama: "", deger: "" });
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
