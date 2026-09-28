import { describe, expect, it } from "vitest";
import { icerikYukle } from "@/lib/icerik/yukle";
import { terimleriIsaretle } from "@/lib/sozluk";

const { sozluk } = icerikYukle();
const terimler = (metin: string) =>
  terimleriIsaretle(metin, sozluk)
    .filter((p) => typeof p !== "string")
    .map((p) => (typeof p === "string" ? "" : `${p.metin}=${p.terim.terim}`));

describe("sözlük", () => {
  it("terimleri ve eş anlamlıları bulur, uzun ifade önce eşleşir", () => {
    expect(terimler("Vergi dairesinden ilişik kesme belgesi alın.")).toEqual(["ilişik kesme belgesi=ilişik kesme belgesi"]);
    expect(terimler("Veraset ilamı gerekir.")).toEqual(["Veraset ilamı=mirasçılık belgesi"]);
  });

  it("her terim metinde yalnızca bir kez işaretlenir", () => {
    expect(terimler("muvafakatname ve yine muvafakatname")).toEqual(["muvafakatname=muvafakatname"]);
  });

  it("kelime ortasında başlamaz ama ek almış hali yakalanır", () => {
    expect(terimler("yetkisizintikal")).toEqual([]);
    expect(terimler("mirasçılık belgesindeki paylara göre")).toEqual(["mirasçılık belgesi=mirasçılık belgesi"]);
  });

  it("parçalar birleşince metin değişmez", () => {
    const m = "Taşınmaz, vergi tahakkuku beklenmeden tescil edilebilir; DASK gerekir.";
    expect(terimleriIsaretle(m, sozluk).map((p) => (typeof p === "string" ? p : p.metin)).join("")).toBe(m);
  });
});
