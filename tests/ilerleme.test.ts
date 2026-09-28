import { describe, expect, it } from "vitest";
import { icerikYukle } from "@/lib/icerik/yukle";
import { bekledikleri, donemler, siradakiAdim, simdikiDonem, yereGore } from "@/lib/kurallar/ilerleme";
import { listeOlustur } from "@/lib/kurallar/liste";
import type { Cevaplar } from "@/lib/sorular";

const icerik = icerikYukle();
const MEHMET: Cevaplar = {
  vefat_tarihi: "2026-08-10",
  vefat_yeri: "turkiye",
  mirasci_yeri: "turkiye",
  calisma_durumu: "emekli",
  sosyal_guvenlik: "4a",
  hak_sahipleri: ["esi_var"],
  varliklar: ["ev_arsa", "baska_sehir_tasinmaz", "arac", "banka", "kredi"],
  borc: "bilmiyorum",
  abonelikler: ["cep", "elektrik", "su", "dogalgaz"],
  mirasci_sayisi: "4_arti",
  mirascilik_belgesi: "hayir",
};
const liste = listeOlustur(MEHMET, icerik, "2026-09-28");
const adim = (id: string) => liste.adimlar.find((a) => a.id === id)!;

describe("sıradaki adım ve bekleyenler", () => {
  it("uyarı niteliğindeki adım önerilmez, listedeki ilk iş önerilir", () => {
    expect(siradakiAdim(liste, new Set())?.id).toBe("olum_belgesi");
    expect(siradakiAdim(liste, new Set(["olum_belgesi"]))?.id).toBe("mirascilik_belgesi");
  });

  it("mirasçılık belgesi yokken ona bağlı adımlar bekler, alınınca açılır", () => {
    expect(bekledikleri(adim("banka_hesaplari"), liste, new Set()).map((a) => a.id)).toEqual(["mirascilik_belgesi"]);
    expect(bekledikleri(adim("banka_hesaplari"), liste, new Set(["mirascilik_belgesi"]))).toEqual([]);
  });

  it("belge zaten alınmışsa (adım listede yok) beklenmez", () => {
    const l = listeOlustur({ ...MEHMET, mirascilik_belgesi: "evet" }, icerik, "2026-09-28");
    const a = l.adimlar.find((x) => x.id === "banka_hesaplari")!;
    expect(bekledikleri(a, l, new Set())).toEqual([]);
  });

  it("son tarihe 30 gün veya daha az kaldıysa o adım öne alınır", () => {
    const l = listeOlustur(MEHMET, icerik, "2026-10-20"); // reddi miras: 21 gün
    expect(siradakiAdim(l, new Set(["olum_belgesi"]))?.id).toBe("reddi_miras");
  });

  it("şu anki dönem ilk yapılmamış adımın dönemidir", () => {
    expect(simdikiDonem(liste, new Set())).toBe("ilk_hafta");
    expect(simdikiDonem(liste, new Set(["olum_belgesi"]))).toBe("ilk_ay");
  });
});

describe("dönemler ve yerler", () => {
  it("dönem özetleri sayar ve son tarihi işaretler", () => {
    const d = donemler(liste, new Set(["olum_belgesi"]));
    expect(d.find((x) => x.grup === "ilk_hafta")).toMatchObject({ biten: 1 });
    expect(d.find((x) => x.grup === "ilk_3_ay")?.sonTarihVar).toBe(true);
  });

  it("yere göre gruplar belgeleri birleştirir", () => {
    const y = yereGore(liste, icerik.belgeler, ["ev", "vergi_dairesi", "noter_mahkeme"]);
    const vergi = y.find((x) => x.yer === "vergi_dairesi")!;
    expect(vergi.adimlar.map((a) => a.id)).toEqual(["veraset_beyannamesi", "ilisik_kesme"]);
    expect(vergi.belgeler.map((b) => b.id)).toContain("rayic_bedel");
    expect(y.find((x) => x.yer === "ev")!.adimlar.length).toBeGreaterThan(3);
  });
});
