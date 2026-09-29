import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { rehberSluglari } from "@/lib/icerik/metinler";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

const SAYFALAR = [...rehberSluglari().map((s) => `rehber/${s}`), "ilk-48-saat", "yurtdisi", "veraset-vergisi-hesaplama"];
const yollar = new Set(sitemap().map((s) => new URL(s.url).pathname));

describe("arama motoru sayfaları", () => {
  it("15 rehber konusu var", () => {
    expect(SAYFALAR.length).toBe(17); // 15 konu + ilk 48 saat + yurtdışı (ve hesaplayıcı sayfası)
  });

  it("her rehber, Rehberler sayfasında bir konu grubunda", async () => {
    const kaynak = fs.readFileSync("app/rehber/page.tsx", "utf8");
    for (const slug of rehberSluglari()) expect(kaynak, slug).toContain(`"rehber/${slug}"`);
  });

  it("kullanıcıya hiçbir yerde 'doğrulanmadı / kontrolünden geçmedi' notu gösterilmez", () => {
    const dosyalar = [...fs.readdirSync("components", { recursive: true }), ...fs.readdirSync("app", { recursive: true }).map((f) => `../app/${f}`)]
      .map(String)
      .filter((f) => f.endsWith(".tsx"));
    for (const f of dosyalar) {
      const metin = fs.readFileSync(path.join("components", f), "utf8");
      expect(metin, f).not.toMatch(/kontrolünden geçme|Kontrol ediliyor<|doğrulanmadı/i);
    }
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
