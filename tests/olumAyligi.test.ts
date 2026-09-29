import { describe, expect, it } from "vitest";
import { olumAyligiPaylari, type OlumCocuk, type OlumGirdisi } from "@/lib/olumAyligi";

const yok = { ad: "", sag: false, gelir: "bilinmiyor" as const, yas65Ustu: false };
const temel: OlumGirdisi = { aylik: 20000, esVar: false, esCalisiyor: false, cocuklar: [], anne: { ...yok, ad: "Annesi" }, baba: { ...yok, ad: "Babası" } };
const cocuk = (ad: string, durum: OlumCocuk["durum"] = "yas", ek: Partial<OlumCocuk> = {}): OlumCocuk => ({ ad, durum, calisiyor: false, digerEbeveyn: "es", ...ek });
const tablo = (g: OlumGirdisi) => Object.fromEntries(olumAyligiPaylari(g).satirlar.map((s) => [s.kim, Math.round(s.oran * 1000) / 10]));

describe("ölüm aylığı paylaşımı (5510 m.34)", () => {
  it("yalnız eş, çalışmıyor: %75", () => {
    expect(tablo({ ...temel, esVar: true })).toEqual({ Eşi: 75 });
    expect(olumAyligiPaylari({ ...temel, esVar: true }).satirlar[0].tutar).toBe(15000);
  });

  it("yalnız eş, çalışıyor: %50", () => {
    expect(tablo({ ...temel, esVar: true, esCalisiyor: true })).toEqual({ Eşi: 50 });
  });

  it("eş ve bir küçük çocuk: %50 + %25", () => {
    expect(tablo({ ...temel, esVar: true, cocuklar: [cocuk("Ali")] })).toEqual({ Eşi: 50, Ali: 25 });
  });

  it("eş ve üç çocuk: toplam %125, orantılı indirilir", () => {
    const s = olumAyligiPaylari({ ...temel, esVar: true, cocuklar: [cocuk("A"), cocuk("B"), cocuk("C")] });
    expect(s.indirimYapildi).toBe(true);
    expect(tablo({ ...temel, esVar: true, cocuklar: [cocuk("A"), cocuk("B"), cocuk("C")] })).toEqual({ Eşi: 40, A: 20, B: 20, C: 20 });
  });

  it("eş yoksa çocuklar %50 alır, toplam aylığı geçemez", () => {
    expect(tablo({ ...temel, cocuklar: [cocuk("A"), cocuk("B")] })).toEqual({ A: 50, B: 50 });
    expect(tablo({ ...temel, cocuklar: [cocuk("A"), cocuk("B"), cocuk("C")] })).toEqual({ A: 33.3, B: 33.3, C: 33.3 });
  });

  it("çalışan kız çocuğu alamaz, yaş şartıyla alan çocuğun çalışması engel değil", () => {
    const s = olumAyligiPaylari({ ...temel, esVar: true, cocuklar: [cocuk("Ayşe", "kiz", { calisiyor: true }), cocuk("Ali", "yas", { calisiyor: true })] });
    expect(s.alamayanlar).toEqual(["Ayşe"]);
    expect(s.satirlar.map((x) => x.kim)).toEqual(["Eşi", "Ali"]);
  });

  it("anne-baba: artan pay varsa toplam %25", () => {
    const g = { ...temel, esVar: true, esCalisiyor: true, anne: { ad: "Annesi", sag: true, gelir: "dusuk" as const, yas65Ustu: false } };
    expect(tablo(g)).toEqual({ Eşi: 50, Annesi: 25 });
  });

  it("anne-baba: artan pay yoksa alamaz, 65 yaş üstündeyse alır (sonra orantılı indirim)", () => {
    const dolu = { ...temel, cocuklar: [cocuk("A"), cocuk("B")] }; // %100
    const anne = { ad: "Annesi", sag: true, gelir: "dusuk" as const, yas65Ustu: false };
    expect(olumAyligiPaylari({ ...dolu, anne }).alamayanlar).toEqual(["Annesi"]);
    expect(tablo({ ...dolu, anne: { ...anne, yas65Ustu: true } })).toEqual({ A: 40, B: 40, Annesi: 20 });
  });

  it("çocuğun %50 koşulları ayrı ayrı: diğer ebeveyn vefat, evlilik bağı yok, sonradan evlenme", () => {
    const es = { ...temel, esVar: true, esCalisiyor: true };
    expect(tablo({ ...es, cocuklar: [cocuk("A", "yas", { digerEbeveyn: "vefat" })] })).toEqual({ Eşi: 50, A: 50 });
    expect(tablo({ ...es, cocuklar: [cocuk("A", "yas", { digerEbeveyn: "evli_degil" })] })).toEqual({ Eşi: 50, A: 50 });
    expect(tablo({ ...es, cocuklar: [cocuk("A", "yas", { digerEbeveyn: "evlendi" })] })).toEqual({ Eşi: 50, A: 50 });
    expect(tablo({ ...es, cocuklar: [cocuk("A")] })).toEqual({ Eşi: 50, A: 25 });
  });

  it("başka hak sahibi yoksa tek çocuk %50", () => {
    expect(tablo({ ...temel, cocuklar: [cocuk("A")] })).toEqual({ A: 50 });
  });

  it("anne-babanın geliri bilinmiyorsa oran gösterilmez", () => {
    const g = { ...temel, esVar: true, esCalisiyor: true, anne: { ad: "Annesi", sag: true, gelir: "bilinmiyor" as const, yas65Ustu: true } };
    const s = olumAyligiPaylari(g);
    expect(s.satirlar.map((x) => x.kim)).toEqual(["Eşi"]);
    expect(s.belirsizler).toEqual(["Annesi"]);
  });

  it("geliri yüksek anne-baba alamaz", () => {
    const g = { ...temel, esVar: true, esCalisiyor: true, baba: { ad: "Babası", sag: true, gelir: "yuksek" as const, yas65Ustu: false } };
    expect(olumAyligiPaylari(g).alamayanlar).toEqual(["Babası"]);
  });
});
