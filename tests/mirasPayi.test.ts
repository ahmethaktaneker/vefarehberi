import { describe, expect, it } from "vitest";
import { kesirToplami, mirasPaylari, ortakPaydayla, type Kardes, type Kisi, type MirasGirdisi } from "@/lib/mirasPayi";

const kisi = (ad: string, sag = true, cocukSayisi = 0): Kisi => ({ ad, sag, cocukSayisi });
const kardes = (ad: string, tur: Kardes["tur"], sag = true, cocukSayisi = 0): Kardes => ({ ad, tur, sag, cocukSayisi });
const bos: MirasGirdisi = { esSag: false, cocuklar: [], anneSag: false, babaSag: false, kardesler: [] };

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

  it("çocuk, anne-baba, kardeş yoksa hesap kapsam dışıdır; eşe en az 3/4", () => {
    expect(mirasPaylari({ ...bos, esSag: true })).toEqual({ durum: "kapsam_disi", esPayi: { pay: 3, payda: 4 } });
    expect(mirasPaylari(bos)).toEqual({ durum: "kapsam_disi", esPayi: null });
  });
});
