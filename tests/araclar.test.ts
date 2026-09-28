import { describe, expect, it } from "vitest";
import { icerikYukle } from "@/lib/icerik/yukle";
import { tutarOku, verasetVergisiHesapla } from "@/lib/hesaplayici";
import { paylasimCoz, paylasimKodla } from "@/lib/paylasim";
import { icsOlustur } from "@/lib/takvim";
import type { Cevaplar } from "@/lib/sorular";

const p = icerikYukle().parametreler;

describe("veraset vergisi hesaplayıcı (2026 tarifesi)", () => {
  it("çocuk: istisna sonrası ilk iki dilim", () => {
    const s = verasetVergisiHesapla(10_000_000, "cocuk", p);
    expect(s.istisna).toBe(2_907_136);
    expect(s.matrah).toBe(7_092_864);
    // 3.000.000 × %1 + 4.092.864 × %3
    expect(s.vergi).toBe(152_785.92);
  });

  it("istisna altında kalan pay için vergi çıkmaz", () => {
    expect(verasetVergisiHesapla(2_000_000, "cocuk", p).vergi).toBe(0);
    expect(verasetVergisiHesapla(5_000_000, "es_cocuksuz", p).vergi).toBe(0);
    expect(verasetVergisiHesapla(5_000_000, "es_cocuklu", p).vergi).toBeGreaterThan(0);
  });

  it("diğer mirasçılarda istisna yok; tüm dilimler", () => {
    const s = verasetVergisiHesapla(60_000_000, "diger", p);
    expect(s.istisna).toBe(0);
    // 30.000 + 210.000 + 750.000 + 2.100.000 + 5.000.000 × %10
    expect(s.vergi).toBe(3_590_000);
    expect(s.dilimler.at(-1)).toMatchObject({ alt: 55_000_000, ust: null, matrah: 5_000_000 });
  });

  it("Türkçe tutar yazımı", () => {
    expect(tutarOku("5.000.000")).toBe(5_000_000);
    expect(tutarOku("5 000 000 TL")).toBe(5_000_000);
    expect(tutarOku("1250000,50")).toBe(1_250_000.5);
    expect(tutarOku("beş milyon")).toBeNull();
    expect(tutarOku("")).toBeNull();
  });
});

describe("paylaşım bağlantısı", () => {
  const c: Cevaplar = {
    vefat_tarihi: "2026-08-10",
    vefat_yeri: "turkiye",
    mirasci_yeri: "karisik",
    yakinlik: "cocugu",
    calisma_durumu: "emekli",
    sosyal_guvenlik: "4a",
    hak_sahipleri: ["esi_var", "ogrenci_cocuk"],
    varliklar: ["ev_arsa", "arac", "banka", "kredi"],
    borc: "bilmiyorum",
    abonelikler: ["cep", "elektrik"],
    mirasci_sayisi: "4_arti",
    mirascilik_belgesi: "hayir",
  };

  it("kodlanıp çözülünce aynı cevaplar çıkar", () => {
    const kod = paylasimKodla(c);
    expect(kod.length).toBeLessThan(60);
    expect(paylasimCoz(kod)).toEqual(c);
  });

  it("cevapsız sorular korunur", () => {
    const { sosyal_guvenlik: _, ...eksik } = c;
    void _;
    expect(paylasimCoz(paylasimKodla(eksik))).toEqual(eksik);
  });

  it("bozuk veya bilinmeyen kodlar reddedilir", () => {
    expect(paylasimCoz("")).toBeNull();
    expect(paylasimCoz("9.20260810")).toBeNull();
    expect(paylasimCoz(paylasimKodla(c).replace("20260810", "20260231"))).toBeNull();
    expect(paylasimCoz("1.20260810.z.0.0.0.0.0.0.0.0.0.0")).toBeNull();
  });
});

describe(".ics takvim dosyası", () => {
  const ics = icsOlustur(
    [{ id: "reddi_miras", baslik: "Mirası reddetmeyi değerlendirin", tarih: "2026-11-10", aciklama: "Satır 1\nSatır 2, noktalı; virgüllü" }],
    new Date("2026-09-28T10:00:00Z"),
  );

  it("tüm gün etkinlik ve hatırlatmalar", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261110");
    expect(ics).toContain("DTEND;VALUE=DATE:20261111");
    expect(ics).toContain("TRIGGER:-P7D");
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).toContain("DTSTAMP:20260928T100000Z");
  });

  it("özel karakterler kaçırılır, satırlar CRLF ve 75 baytı aşmaz", () => {
    expect(ics).toContain("Satır 1\\nSatır 2\\, noktalı\\; virgüllü");
    const satirlar = ics.split("\r\n");
    expect(satirlar.every((s) => new TextEncoder().encode(s).length <= 75)).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("ay sonunda bitiş tarihi bir sonraki aya geçer", () => {
    expect(icsOlustur([{ id: "x", baslik: "x", tarih: "2026-12-31", aciklama: "" }])).toContain("DTEND;VALUE=DATE:20270101");
  });
});
