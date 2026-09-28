import { describe, expect, it } from "vitest";
import { icerikYukle } from "@/lib/icerik/yukle";
import { donemGecerli, listeOlustur, verasetSuresi } from "@/lib/kurallar/liste";
import type { Cevaplar } from "@/lib/sorular";

const icerik = icerikYukle();
const BUGUN = "2026-09-28";

const idler = (c: Cevaplar) => listeOlustur(c, icerik, BUGUN).adimlar.map((a) => a.id);
const adim = (c: Cevaplar, id: string) => listeOlustur(c, icerik, BUGUN).adimlar.find((a) => a.id === id);

// Brief Bölüm 2'deki personalar.
const MEHMET: Cevaplar = {
  vefat_tarihi: "2026-08-10",
  vefat_yeri: "turkiye",
  mirasci_yeri: "turkiye",
  yakinlik: "cocugu",
  calisma_durumu: "emekli",
  sosyal_guvenlik: "4a",
  hak_sahipleri: ["esi_var"],
  varliklar: ["ev_arsa", "baska_sehir_tasinmaz", "arac", "banka", "kredi"],
  borc: "bilmiyorum",
  abonelikler: ["cep", "elektrik", "su", "dogalgaz"],
  mirasci_sayisi: "4_arti",
  mirascilik_belgesi: "hayir",
};

const ZEYNEP: Cevaplar = {
  vefat_tarihi: "2026-07-20",
  vefat_yeri: "turkiye",
  mirasci_yeri: "turkiye",
  yakinlik: "cocugu",
  calisma_durumu: "calismiyordu",
  hak_sahipleri: ["hicbiri"],
  varliklar: ["kredi_karti"],
  borc: "bilmiyorum",
  abonelikler: ["cep"],
  mirasci_sayisi: "1",
  mirascilik_belgesi: "hayir",
};

const AHMET: Cevaplar = {
  vefat_tarihi: "2026-09-01",
  vefat_yeri: "turkiye",
  mirasci_yeri: "yurtdisi",
  yakinlik: "cocugu",
  calisma_durumu: "emekli",
  sosyal_guvenlik: "4b",
  hak_sahipleri: ["esi_var"],
  varliklar: ["ev_arsa", "banka"],
  borc: "hayir",
  abonelikler: ["bilmiyorum"],
  mirasci_sayisi: "2_3",
  mirascilik_belgesi: "hayir",
};

describe("persona: Mehmet (emekli baba, çok varlık, kredi)", () => {
  const liste = listeOlustur(MEHMET, icerik, BUGUN);

  it("beklenen adımlar", () => {
    expect(liste.adimlar.map((a) => a.id)).toEqual([
      "olum_belgesi",
      "hesaptan_para_cekmeyin",
      "mirascilik_belgesi",
      "banka_hesaplari",
      "tasinmazlar",
      "hayat_sigortasi_sorgulama",
      "risk_raporu",
      "kredi_hayat_sigortasi",
      "abonelikler",
      "varis_hizmetleri",
      "otomatik_odeme_talimatlari",
      "telefon_internet",
      "reddi_miras",
      "olum_ayligi",
      "cenaze_odenegi",
      "veraset_beyannamesi",
      "ilisik_kesme",
      "tapu_intikali",
      "arac_devri",
      "guvence_bedeli_iadesi",
      "dijital_hesaplar",
    ]);
  });

  it("son tarihler: reddi miras 3 ay, veraset 4 ay", () => {
    expect(liste.sonTarihliler.map((a) => [a.id, a.sonTarihBilgisi])).toEqual([
      ["reddi_miras", { tarih: "2026-11-10", kalanGun: 43, gecti: false, belirsizNot: undefined }],
      ["veraset_beyannamesi", { tarih: "2026-12-10", kalanGun: 73, gecti: false, belirsizNot: undefined }],
    ]);
  });

  it("avukat uyarısı yok (borç 'bilmiyorum')", () => {
    expect(liste.avukatUyarilari).toEqual([]);
  });
});

describe("persona: Zeynep (mal yok, kredi kartı borcu olabilir)", () => {
  const liste = listeOlustur(ZEYNEP, icerik, BUGUN);

  it("beklenen adımlar", () => {
    expect(liste.adimlar.map((a) => a.id)).toEqual([
      "olum_belgesi",
      "mirascilik_belgesi",
      "hayat_sigortasi_sorgulama",
      "risk_raporu",
      "varis_hizmetleri",
      "otomatik_odeme_talimatlari",
      "telefon_internet",
      "reddi_miras",
      "cenaze_odenegi",
      "dijital_hesaplar",
    ]);
  });

  it("reddi miras son tarihi 22 gün sonra", () => {
    expect(liste.sonTarihliler.map((a) => [a.id, a.sonTarihBilgisi?.tarih, a.sonTarihBilgisi?.kalanGun])).toEqual([
      ["reddi_miras", "2026-10-20", 22],
    ]);
  });
});

describe("persona: Ahmet (mirasçılar yurtdışında)", () => {
  const liste = listeOlustur(AHMET, icerik, BUGUN);

  it("beklenen adımlar", () => {
    expect(liste.adimlar.map((a) => a.id)).toEqual([
      "olum_belgesi",
      "hesaptan_para_cekmeyin",
      "hesap_ve_abonelikleri_not_alin",
      "mirascilik_belgesi",
      "banka_hesaplari",
      "tasinmazlar",
      "hayat_sigortasi_sorgulama",
      "abonelikler",
      "yurtdisi_vekaletname",
      "varis_hizmetleri",
      "otomatik_odeme_talimatlari",
      "telefon_internet",
      "olum_ayligi",
      "cenaze_odenegi",
      "veraset_beyannamesi",
      "ilisik_kesme",
      "tapu_intikali",
      "guvence_bedeli_iadesi",
      "dijital_hesaplar",
    ]);
  });

  it("veraset beyannamesi süresi 6 ay", () => {
    expect(liste.sonTarihliler.map((a) => [a.id, a.sonTarihBilgisi?.tarih])).toEqual([
      ["veraset_beyannamesi", "2027-03-01"],
    ]);
  });
});

describe("'Bilmiyorum' cevapları", () => {
  it("varlıklar 'bilmiyorum' → nasıl öğrenirim adımları eklenir ve belirsiz işaretlenir", () => {
    const c = { ...ZEYNEP, varliklar: ["bilmiyorum"] };
    const ids = idler(c);
    for (const id of ["hesap_ve_abonelikleri_not_alin", "banka_hesaplari", "tasinmazlar", "veraset_beyannamesi"]) {
      expect(ids).toContain(id);
      expect(adim(c, id)?.belirsiz).toBe(true);
    }
  });

  it("borç 'bilmiyorum' → risk raporu ve reddi miras eklenir", () => {
    const c = { ...AHMET, borc: "bilmiyorum" };
    expect(idler(c)).toEqual(expect.arrayContaining(["risk_raporu", "reddi_miras"]));
    expect(adim(c, "risk_raporu")?.belirsiz).toBe(true);
  });

  it("abonelikler 'bilmiyorum' → abonelik adımı belirsiz işaretli", () => {
    expect(adim(AHMET, "abonelikler")?.belirsiz).toBe(true);
    expect(adim(MEHMET, "abonelikler")?.belirsiz).toBe(false);
  });

  it("sosyal güvenlik 'bilmiyorum' → Emekli Sandığı ölüm yardımı belirsiz olarak gösterilir", () => {
    const c = { ...MEHMET, sosyal_guvenlik: "bilmiyorum" };
    expect(adim(c, "emekli_sandigi_olum_yardimi")?.belirsiz).toBe(true);
  });

  it("çalışma durumu 'bilmiyorum' → kıdem tazminatı belirsiz olarak gösterilir", () => {
    const c = { ...MEHMET, calisma_durumu: "bilmiyorum", sosyal_guvenlik: "bilmiyorum" };
    expect(adim(c, "kidem_tazminati")?.belirsiz).toBe(true);
  });

  it("mirasçılık belgesi 'bilmiyorum' → belge adımı belirsiz, 'evet' → gösterilmez", () => {
    expect(adim({ ...MEHMET, mirascilik_belgesi: "bilmiyorum" }, "mirascilik_belgesi")?.belirsiz).toBe(true);
    expect(idler({ ...MEHMET, mirascilik_belgesi: "evet" })).not.toContain("mirascilik_belgesi");
  });
});

describe("kurallar", () => {
  it("gizlenen sorunun eski cevabı dikkate alınmaz", () => {
    const c = { ...ZEYNEP, sosyal_guvenlik: "4c" }; // çalışmıyordu → soru 6 gizli
    expect(idler(c)).not.toContain("emekli_sandigi_olum_yardimi");
  });

  it("yurtdışında vefatta ölüm belgesi yerine dış temsilcilik bildirimi gösterilir", () => {
    const ids = idler({ ...MEHMET, vefat_yeri: "yurtdisi" });
    expect(ids).toContain("yurtdisi_olum_bildirimi");
    expect(ids).not.toContain("olum_belgesi");
    expect(idler(MEHMET)).not.toContain("yurtdisi_olum_bildirimi");
  });

  it("süresi geçmiş son tarih işaretlenir", () => {
    const c = { ...ZEYNEP, vefat_tarihi: "2026-05-01" };
    const r = adim(c, "reddi_miras")?.sonTarihBilgisi;
    expect(r).toMatchObject({ tarih: "2026-08-01", gecti: true });
    expect(r!.kalanGun).toBeLessThan(0);
  });

  it("veraset süresi: VİVK m.9 kombinasyonları", () => {
    const p = icerik.parametreler;
    const sure = (vefat_yeri: string, mirasci_yeri: string) => verasetSuresi({ vefat_yeri, mirasci_yeri }, p);
    // Kesin durumlar
    expect(sure("turkiye", "turkiye")).toEqual({ ay: 4, belirsiz: false });
    expect(sure("turkiye", "yurtdisi")).toEqual({ ay: 6, belirsiz: false });
    expect(sure("yurtdisi", "turkiye")).toEqual({ ay: 6, belirsiz: false });
    // Ayırt edilemeyen durumlar: en kısa süre, belirsiz
    expect(sure("yurtdisi", "yurtdisi")).toEqual({ ay: 4, belirsiz: true }); // aynı ülke 4, başka ülke 8
    expect(sure("turkiye", "karisik")).toEqual({ ay: 4, belirsiz: true });
    expect(sure("yurtdisi", "karisik")).toEqual({ ay: 4, belirsiz: true });

    expect(adim({ ...MEHMET, vefat_yeri: "yurtdisi" }, "veraset_beyannamesi")?.sonTarihBilgisi).toMatchObject({
      tarih: "2027-02-10",
      belirsizNot: undefined,
    });
    expect(adim({ ...MEHMET, mirasci_yeri: "karisik" }, "veraset_beyannamesi")?.sonTarihBilgisi?.belirsizNot).toMatch(
      /farklı olabilir/,
    );
  });

  it("geçerlilik dönemi bitmiş tutar gösterilmez", () => {
    expect(donemGecerli("2026", BUGUN)).toBe(true);
    expect(donemGecerli("2026-01-01..2026-06-30", BUGUN)).toBe(false);
    const c = { ...MEHMET, sosyal_guvenlik: "4c" };
    expect(adim(c, "emekli_sandigi_olum_yardimi")?.tutarBilgisi).toEqual({ durum: "guncel_degil" });
    expect(adim(c, "cenaze_odenegi")?.tutarBilgisi).toMatchObject({ durum: "gecerli", tutar: 6398 });
  });

  it("şirket ve yurtdışı mal için avukat uyarısı", () => {
    const c = { ...MEHMET, borc: "evet", varliklar: ["sirket", "yurtdisi_mal"] };
    expect(listeOlustur(c, icerik, BUGUN).avukatUyarilari.map((u) => u.id)).toEqual([
      "borc",
      "sirket",
      "yurtdisi_mal",
    ]);
  });
});

describe("kurum rehberi ve belge listesi", () => {
  it("kurumlar cevaplara göre süzülür", () => {
    const kurumlar = (c: Cevaplar) => listeOlustur(c, icerik, BUGUN).kurumlar.map((k) => k.tur);
    const zeynep = kurumlar(ZEYNEP); // yalnızca cep telefonu ve kredi kartı
    expect(zeynep).toContain("operator");
    expect(zeynep).toContain("banka");
    expect(zeynep).not.toContain("enerji");
    expect(zeynep).not.toContain("su");
    expect(kurumlar({ ...ZEYNEP, abonelikler: ["hicbiri"], varliklar: ["hicbiri"] })).toEqual([]);
    expect(kurumlar(MEHMET)).toEqual(expect.arrayContaining(["enerji", "dogalgaz", "su"]));
  });

  it("belge listesi gösterilen adımlardan birleşir, tekrar etmez", () => {
    const { belgeListesi } = listeOlustur(MEHMET, icerik, BUGUN);
    const idler = belgeListesi.map((b) => b.belge.id);
    expect(new Set(idler).size).toBe(idler.length);
    const mirascilik = belgeListesi.find((b) => b.belge.id === "mirascilik_belgesi")!;
    expect(mirascilik.adimlar.length).toBeGreaterThan(3);
    expect(mirascilik.belge.not).toMatch(/kopya/);
    // Araç yoksa ruhsat istenmez
    expect(listeOlustur(ZEYNEP, icerik, BUGUN).belgeListesi.map((b) => b.belge.id)).not.toContain("ruhsat");
  });

  it("mirası reddetmeyi düşünenler için hat devri uyarısı", () => {
    expect(adim(MEHMET, "telefon_internet")?.uyari).toMatch(/mirası reddeden/);
  });
});
