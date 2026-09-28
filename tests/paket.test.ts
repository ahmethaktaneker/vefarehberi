import { describe, expect, it } from "vitest";
import { icerikYukle } from "@/lib/icerik/yukle";
import { listeOlustur } from "@/lib/kurallar/liste";
import { paketYukle } from "@/lib/paket";
import { paketTetikleyici } from "@/lib/paketTetikleyici";
import type { Cevaplar } from "@/lib/sorular";

const icerik = icerikYukle();
const paket = paketYukle();
const tetik = (c: Cevaplar, bugun = "2026-09-28") => paketTetikleyici(paket, c, listeOlustur(c, icerik, bugun)).id;

const temel: Cevaplar = {
  vefat_tarihi: "2026-08-10",
  vefat_yeri: "turkiye",
  mirasci_yeri: "turkiye",
  yakinlik: "cocugu",
  calisma_durumu: "emekli",
  sosyal_guvenlik: "4a",
  hak_sahipleri: ["esi_var"],
  varliklar: ["ev_arsa", "banka"],
  borc: "hayir",
  abonelikler: ["cep"],
  mirasci_sayisi: "2_3",
  mirascilik_belgesi: "hayir",
};

describe("Takip Paketi", () => {
  it("brief'teki üç fiyat", () => {
    expect(paket.fiyatlar).toEqual([499, 999, 1999]);
  });

  it("tetikleyiciler brief'e göre", () => {
    expect(tetik(temel)).toBe("genel");
    expect(tetik({ ...temel, varliklar: ["baska_sehir_tasinmaz"] })).toBe("baska_sehir_tasinmaz");
    expect(tetik({ ...temel, mirasci_yeri: "karisik" })).toBe("yurtdisi_mirasci");
    expect(tetik({ ...temel, mirasci_sayisi: "4_arti" })).toBe("kalabalik_aile");
  });

  it("veraset son tarihine 30 gün veya daha az kaldıysa beyanname tetikleyicisi önce gelir", () => {
    // Son tarih 2026-12-10; 2026-11-15'te 25 gün kalır
    expect(tetik({ ...temel, varliklar: ["baska_sehir_tasinmaz"] }, "2026-11-15")).toBe("veraset_30_gun");
    // Süre geçtiyse tetiklenmez
    expect(tetik(temel, "2026-12-20")).toBe("genel");
  });
});
