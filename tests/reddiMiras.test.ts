import { describe, expect, it } from "vitest";
import { bosVeri, yeniBorc, yeniKalem as yeniVarlik, yeniTasinmaz } from "@/lib/beyanname/hesap";
import { redSuresi, tabloBaslat, tabloOzeti } from "@/lib/reddiMiras";

describe("reddi miras tablosu", () => {
  it("beyanname verisinden başlar; cenaze masrafı borç sayılmaz, hisse uygulanır", () => {
    const b = bosVeri();
    b.tasinmazlar.push({ ...yeniTasinmaz(), ilce: "Kadıköy", hisse: "1/2", deger: "4.000.000" });
    b.digerleri.push({ ...yeniVarlik("banka"), aciklama: "Vadesiz", deger: "500.000" });
    b.borclar.push({ ...yeniBorc("belgeli_borc"), aciklama: "Kredi", tutar: "3.000.000" }, { ...yeniBorc("cenaze"), tutar: "40.000" });
    const t = tabloBaslat(b, []);
    expect(t.varliklar.map((x) => x.ad)).toEqual(["Daire / ev, Kadıköy", "Banka hesabı, Vadesiz"]);
    expect(t.borclar).toHaveLength(1);
    expect(tabloOzeti(t)).toEqual({ varlik: 2_500_000, borc: 3_000_000, fark: -500_000, eksik: 0 });
  });

  it("beyanname yoksa listedeki cevaplardan boş satırlar gelir", () => {
    const t = tabloBaslat(null, ["ev_arsa", "kredi_karti"]);
    expect(t.varliklar.map((x) => x.ad)).toEqual(["Ev / arsa"]);
    expect(t.borclar.map((x) => x.ad)).toEqual(["Kredi kartı"]);
    expect(tabloOzeti(t).eksik).toBe(2);
  });

  it("3 aylık süre ve kalan gün", () => {
    expect(redSuresi("2026-08-10", "2026-10-20")).toEqual({ sonGun: "2026-11-10", kalanGun: 21 });
    expect(redSuresi("", "2026-10-20")).toBeNull();
  });
});
