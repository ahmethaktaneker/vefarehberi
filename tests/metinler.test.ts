import { describe, expect, it } from "vitest";
import { sablonlariYukle, sayfaYukle, yerTutucular } from "@/lib/icerik/metinler";
import { sablonDoldur } from "@/lib/sablonlar/doldur";

describe("dilekçe şablonları", () => {
  const sablonlar = sablonlariYukle();

  it("Üç ücretsiz şablon ve reddi miras beyanı var, hepsi doğrulanmamış", () => {
    expect(sablonlar.map((s) => s.id).sort()).toEqual(["abonelik_iptal", "banka_bakiye_yazisi", "mirasin_reddi", "otomatik_odeme_iptal"]);
    expect(sablonlar.every((s) => !s.dogrulandi && !s.ucretli_icerik)).toBe(true);
  });

  it("her yer tutucunun bir alanı, her alanın bir yer tutucusu var", () => {
    for (const s of sablonlar) {
      expect(yerTutucular(s.govde).sort()).toEqual(s.alanlar.map((a) => a.id).sort());
    }
  });

  it("reddi miras beyanı şablonu var (proje sahibinin 29.09.2026 kararı)", () => {
    expect(sablonlar.some((s) => s.id === "mirasin_reddi")).toBe(true);
  });

  it("doldurma: girilen değerler yerleşir, boşlar noktalı kalır", () => {
    const metin = sablonDoldur("{{a}} ve {{b}}", { a: " Ayşe " });
    expect(metin).toBe("Ayşe ve ........................");
  });
});

describe("rehber sayfaları", () => {
  it("ilk 48 saat ve yurtdışı sayfaları geçerli", () => {
    for (const slug of ["ilk-48-saat", "yurtdisi"]) {
      const s = sayfaYukle(slug);
      expect(s.kaynak.length).toBeGreaterThan(0);
      expect(s.govde).toContain("## ");
    }
  });
});
