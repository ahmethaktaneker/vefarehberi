import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { rehberSluglari } from "@/lib/icerik/metinler";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

const SAYFALAR = [...rehberSluglari().map((s) => `rehber/${s}`), "ilk-48-saat", "yurtdisi", "veraset-vergisi-hesaplama"];
const yollar = new Set(sitemap().map((s) => new URL(s.url).pathname));

describe("arama motoru sayfaları (Brief 14)", () => {
  it("brief'teki 10 konu var", () => {
    expect(SAYFALAR.length).toBe(12); // 10 konu + ilk 48 saat + yas desteği
  });

  it.each(SAYFALAR)("%s: kaynaklı, sık sorulan sorulu, doldurulmamış yer tutucusu yok", (slug) => {
    const s = hazirSayfa(slug);
    expect(s.kaynak.length).toBeGreaterThan(0);
    expect(JSON.stringify(s)).not.toMatch(/\{\{/);
    if (slug !== "ilk-48-saat") expect(s.sss.length).toBeGreaterThan(0);
  });

  it.each(SAYFALAR)("%s: sayfa içi bağlantılar var olan sayfalara gider", (slug) => {
    const icBaglantilar = [...hazirSayfa(slug).govde.matchAll(/\]\((\/[^)#\s]*)\)/g)].map((m) => m[1]);
    for (const b of icBaglantilar) expect(yollar, `${slug} → ${b}`).toContain(b);
  });

  it("tutarlar parametre dosyasından gelir", () => {
    expect(hazirSayfa("rehber/cenaze-odenegi").govde).toContain("6.398 TL");
    expect(hazirSayfa("veraset-vergisi-hesaplama").sss[1].cevap).toContain("55.000.000 TL'yi aşan kısım için %10");
  });
});
