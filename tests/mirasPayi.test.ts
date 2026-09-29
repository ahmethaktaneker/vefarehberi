import { describe, expect, it } from "vitest";
import { kesirToplami, mirasPaylari, ortakPaydayla, type BuyukKol, type Kardes, type Kisi, type MirasGirdisi } from "@/lib/mirasPayi";

const kisi = (ad: string, sag = true, cocukSayisi = 0): Kisi => ({ ad, sag, cocukSayisi });
const kardes = (ad: string, tur: Kardes["tur"], sag = true, cocukSayisi = 0): Kardes => ({ ad, tur, sag, cocukSayisi });
const bos: MirasGirdisi = { esSag: false, cocuklar: [], anneSag: false, babaSag: false, kardesler: [] };
const kol = (buyukanneSag: boolean, buyukbabaSag: boolean, cocuklar: Kisi[] = []): BuyukKol => ({ buyukanneSag, buyukbabaSag, cocuklar });
const bosKol = kol(false, false);

function paylar(g: MirasGirdisi) {
  const s = mirasPaylari(g);
  if (s.durum !== "tamam") throw new Error("kapsam dışı");
  expect(kesirToplami(s.satirlar)).toEqual({ pay: 1, payda: 1 });
  return Object.fromEntries(s.satirlar.map((x) => [x.kim, ortakPaydayla(x.pay, s.ortakPayda)]));
}

describe("yasal miras payları (TMK m.495-499)", () => {
  it("eş ve iki çocuk: eş 1/4, çocuklar 3/8'er", () => {
    expect(paylar({ ...bos, esSag: true, cocuklar: [kisi("Ali"), kisi("Ayşe")] })).toEqual({ Eşi: "2/8", Ali: "3/8", Ayşe: "3/8" });
  });

  it("eş ve üç çocuk: herkes 1/4", () => {
    const p = paylar({ ...bos, esSag: true, cocuklar: [kisi("A"), kisi("B"), kisi("C")] });
    expect(p).toEqual({ Eşi: "1/4", A: "1/4", B: "1/4", C: "1/4" });
  });

  it("eş yoksa çocuklar eşit alır", () => {
    expect(paylar({ ...bos, cocuklar: [kisi("A"), kisi("B")] })).toEqual({ A: "1/2", B: "1/2" });
  });

  it("önceden ölen çocuğun payı kendi çocuklarına geçer (halefiyet)", () => {
    const p = paylar({ ...bos, esSag: true, cocuklar: [kisi("Ali"), kisi("Veli", false, 2)] });
    expect(p).toEqual({ Eşi: "4/16", Ali: "6/16", "Veli adına 1. çocuğu": "3/16", "Veli adına 2. çocuğu": "3/16" });
  });

  it("önceden ölen ve çocuğu olmayan çocuk sayılmaz", () => {
    expect(paylar({ ...bos, cocuklar: [kisi("Ali"), kisi("Veli", false, 0)] })).toEqual({ Ali: "1/1" });
  });

  it("çocuk yoksa eş 1/2, anne ve baba 1/4'er", () => {
    expect(paylar({ ...bos, esSag: true, anneSag: true, babaSag: true })).toEqual({ Eşi: "2/4", Annesi: "1/4", Babası: "1/4" });
  });

  it("baba önceden ölmüşse payı kardeşlere geçer", () => {
    const p = paylar({ ...bos, esSag: true, anneSag: true, kardesler: [kardes("Can", "tam"), kardes("Ece", "tam")] });
    expect(p).toEqual({ Eşi: "4/8", Annesi: "2/8", Can: "1/8", Ece: "1/8" });
  });

  it("anne bir kardeş yalnızca anne tarafından alır", () => {
    const p = paylar({ ...bos, kardesler: [kardes("Tam", "tam"), kardes("AnneBir", "anne_bir")] });
    // Anne tarafı 1/2: Tam ve AnneBir 1/4'er. Baba tarafı 1/2: yalnızca Tam.
    expect(p).toEqual({ Tam: "3/4", AnneBir: "1/4" });
  });

  it("bir tarafta hiç mirasçı yoksa bütün pay diğer tarafa kalır", () => {
    expect(paylar({ ...bos, esSag: true, anneSag: true })).toEqual({ Eşi: "1/2", Annesi: "1/2" });
  });

  it("önceden ölen kardeşin payı çocuklarına (yeğenlere) geçer", () => {
    const p = paylar({ ...bos, anneSag: true, kardesler: [kardes("Can", "tam", false, 2)] });
    expect(p).toEqual({ Annesi: "2/4", "Can adına 1. çocuğu (yeğen)": "1/4", "Can adına 2. çocuğu (yeğen)": "1/4" });
  });

  it("büyükler bilgisi verilmezse ya da üvey amca/dayı varsa hesaplanmaz; eşe en az 3/4", () => {
    expect(mirasPaylari({ ...bos, esSag: true })).toEqual({ durum: "kapsam_disi", esPayi: { pay: 3, payda: 4 } });
    expect(mirasPaylari(bos)).toEqual({ durum: "kapsam_disi", esPayi: null });
    expect(mirasPaylari({ ...bos, buyukler: { anne: kol(true, true), baba: bosKol }, uveyVar: true }).durum).toBe("kapsam_disi");
  });
});

describe("büyük ana-baba zümresi (TMK m.497)", () => {
  it("dört büyük de sağ: her biri 1/4", () => {
    expect(paylar({ ...bos, buyukler: { anne: kol(true, true), baba: kol(true, true) } })).toEqual({
      Anneannesi: "1/4",
      "Anne tarafından dedesi": "1/4",
      Babaannesi: "1/4",
      "Baba tarafından dedesi": "1/4",
    });
  });

  it("eş varsa eş 3/4, büyükler kalan 1/4ü paylaşır", () => {
    expect(paylar({ ...bos, esSag: true, buyukler: { anne: kol(true, true), baba: kol(true, true) } })).toEqual({
      Eşi: "12/16",
      Anneannesi: "1/16",
      "Anne tarafından dedesi": "1/16",
      Babaannesi: "1/16",
      "Baba tarafından dedesi": "1/16",
    });
  });

  it("önceden ölen büyüğün payı çocuklarına (dayı, teyze) geçer", () => {
    const p = paylar({ ...bos, buyukler: { anne: kol(true, false, [kisi("Dayı"), kisi("Teyze")]), baba: kol(true, true) } });
    expect(p).toEqual({ Anneannesi: "2/8", Dayı: "1/8", Teyze: "1/8", Babaannesi: "2/8", "Baba tarafından dedesi": "2/8" });
  });

  it("çocuğu olmayan büyüğün payı aynı koldaki diğer büyüğe kalır", () => {
    const p = paylar({ ...bos, buyukler: { anne: kol(true, false), baba: kol(true, true) } });
    expect(p).toEqual({ Anneannesi: "2/4", Babaannesi: "1/4", "Baba tarafından dedesi": "1/4" });
  });

  it("bir kolda kimse yoksa bütün miras diğer kola geçer", () => {
    expect(paylar({ ...bos, buyukler: { anne: bosKol, baba: kol(false, false, [kisi("Amca")]) } })).toEqual({ Amca: "1/1" });
  });

  it("eş yoksa önceden ölen amcanın payı kuzenlere geçer", () => {
    const p = paylar({ ...bos, buyukler: { anne: bosKol, baba: kol(false, false, [kisi("Amca"), kisi("Hala", false, 2)]) } });
    expect(p).toEqual({ Amca: "2/4", "Hala adına 1. çocuğu (kuzen)": "1/4", "Hala adına 2. çocuğu (kuzen)": "1/4" });
  });

  it("eş varsa kuzenler mirasçı olmaz; pay aynı koldaki büyüğe ya da diğer kola geçer", () => {
    const p = paylar({ ...bos, esSag: true, buyukler: { anne: kol(true, false, [kisi("Dayı", false, 2)]), baba: bosKol } });
    expect(p).toEqual({ Eşi: "3/4", Anneannesi: "1/4" });
    const q = paylar({ ...bos, esSag: true, buyukler: { anne: kol(false, false, [kisi("Dayı", false, 2)]), baba: kol(true, false) } });
    expect(q).toEqual({ Eşi: "3/4", Babaannesi: "1/4" });
  });

  it("hiç mirasçı yoksa eşe tamamı, eş de yoksa Devlete kalır", () => {
    expect(paylar({ ...bos, esSag: true, buyukler: { anne: bosKol, baba: bosKol } })).toEqual({ Eşi: "1/1" });
    expect(paylar({ ...bos, buyukler: { anne: bosKol, baba: bosKol } })).toEqual({ "Devlet (Hazine)": "1/1" });
  });
});
