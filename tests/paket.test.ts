import { describe, expect, it } from "vitest";
import { aracGorunur, aracOnerileri, paketOnerisiHesapla as paketOnerisi } from "@/lib/araclar";
import { icerikYukle } from "@/lib/icerik/yukle";
import { listeOlustur } from "@/lib/kurallar/liste";
import { paketYukle } from "@/lib/paket";
import type { Cevaplar } from "@/lib/sorular";

const icerik = icerikYukle();
const temel: Cevaplar = {
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
const oner = (c: Cevaplar, yapilan: string[] = [], bugun = "2026-09-28") => paketOnerisi(c, listeOlustur(c, icerik, bugun), new Set(yapilan));
const araclar = (c: Cevaplar, bugun = "2026-09-28") => aracOnerileri(listeOlustur(c, icerik, bugun), new Set()).map((o) => o.arac.id);

describe("paketler", () => {
  it("iki paket var, fiyat yok", () => {
    const p = paketYukle();
    expect(p.paketler.map((x) => x.id)).toEqual(["beyanname", "aile"]);
    expect(JSON.stringify(p)).not.toMatch(/fiyat/);
  });

  it("yalnızca mal varsa Beyanname Paketi önerilir (araç henüz satışta olmasa da tanıtılır)", () => {
    const o = oner(temel);
    expect(o?.paket).toBe("beyanname");
    expect(o?.nedenler[0]).toMatch(/Beyanname için \d+ gününüz var/);
  });

  it("reddi miras ücretsiz: borç riski tek başına Aile Paketi'ni önermez", () => {
    const o = oner({ ...temel, borc: "bilmiyorum", varliklar: ["ev_arsa", "kredi"] });
    expect(o?.paket).toBe("beyanname");
    expect(o?.nedenler.join(" ")).not.toMatch(/reddetmek/);
  });

  it("kalabalık aile ya da yurtdışındaki mirasçı Aile Paketi'ne yönlendirir", () => {
    expect(oner({ ...temel, mirasci_sayisi: "4_arti" })?.paket).toBe("aile");
    expect(oner({ ...temel, mirasci_yeri: "karisik" })?.paket).toBe("aile");
  });

  it("mal da borç da yoksa paket önerilmez", () => {
    expect(oner({ ...temel, varliklar: ["hicbiri"], borc: "hayir" })).toBeNull();
  });

  it("beyanname yapıldıysa artık Beyanname Paketi önerilmez", () => {
    expect(oner(temel, ["veraset_beyannamesi"])).toBeNull();
  });
});

describe("araç önerileri", () => {
  it("listedeki adımlara göre araçlar, son tarihi yakın olan önce", () => {
    const ids = araclar({ ...temel, borc: "bilmiyorum" });
    expect(ids[0]).toBe("reddi_miras_tablosu");
    expect(ids).toContain("miras_payi");
    expect(ids.includes("beyanname_araci")).toBe(aracGorunur("beyanname_araci"));
    expect(ids.includes("kurum_ziyaret")).toBe(aracGorunur("kurum_ziyaret"));
  });

  it("gizli sayfalardaki araçlar hiçbir öneride çıkmaz", () => {
    const ids = araclar({ ...temel, borc: "bilmiyorum", mirasci_sayisi: "4_arti" });
    expect(ids.every((id) => aracGorunur(id))).toBe(true);
  });

  it("mal yoksa beyanname araçları önerilmez", () => {
    const ids = araclar({ ...temel, varliklar: ["hicbiri"] });
    expect(ids).not.toContain("beyanname_araci");
    expect(ids).not.toContain("veraset_hesaplayici");
  });
});
