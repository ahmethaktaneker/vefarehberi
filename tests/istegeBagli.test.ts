import { describe, expect, it } from "vitest";
import { icerikYukle } from "@/lib/icerik/yukle";
import { listeOlustur } from "@/lib/kurallar/liste";
import type { Cevaplar } from "@/lib/sorular";

const icerik = icerikYukle();
const c: Cevaplar = {
  vefat_tarihi: "2026-08-10",
  vefat_yeri: "turkiye",
  mirasci_yeri: "turkiye",
  calisma_durumu: "emekli",
  sosyal_guvenlik: "4a",
  hak_sahipleri: ["esi_var"],
  varliklar: ["ev_arsa", "banka"],
  borc: "hayir",
  abonelikler: ["cep"],
  mirasci_sayisi: "2_3",
  mirascilik_belgesi: "hayir",
};

describe("isteğe bağlı belgeler", () => {
  it("banka adımında ilişik kesme zorunlu değil, nedeniyle isteğe bağlı", () => {
    const banka = icerik.adimlar.find((a) => a.id === "banka_hesaplari")!;
    expect(banka.belgeler).not.toContain("ilisik_kesme");
    expect(banka.istege_bagli_belgeler.find((b) => b.belge === "ilisik_kesme")?.neden).toMatch(/Parayı çekecekseniz/);
  });

  it("belge listesinde isteğe bağlı belgenin nedeni taşınır", () => {
    const liste = listeOlustur(c, icerik, "2026-09-29");
    const ilisik = liste.belgeListesi.find((s) => s.belge.id === "ilisik_kesme")!;
    const bankadan = ilisik.adimlar.find((a) => a.id === "banka_hesaplari");
    expect(bankadan?.neden).toBeTruthy();
    // İlişik kesme adımının kendisi belgeyi üretir; banka adımı onu beklemez.
    expect(icerik.adimlar.find((a) => a.id === "banka_hesaplari")!.onceki ?? []).not.toContain("ilisik_kesme");
  });
});
