import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AdimSemasi, KosulSemasi } from "@/lib/icerik/sema";
import { icerikYukle } from "@/lib/icerik/yukle";

const gecerliAdim = {
  id: "ornek",
  baslik: "Örnek",
  kategori: "resmi",
  zaman_grubu: "ilk_ay",
  oncelik: "normal",
  ne: "Açıklama",
  yer: "ev",
  kaynak: ["https://ornek.org"],
  son_kontrol: "2026-09-28",
  dogrulandi: false,
  ucretli_icerik: false,
};

function alansiz(alan: keyof typeof gecerliAdim) {
  const kopya: Partial<typeof gecerliAdim> = { ...gecerliAdim };
  delete kopya[alan];
  return kopya;
}

describe("içerik şeması", () => {
  it("gerçek içerik dosyaları geçerli", () => {
    const icerik = icerikYukle();
    expect(icerik.adimlar.length).toBeGreaterThanOrEqual(10);
    // Faz 1: hiçbir içerik avukat kontrolünden geçmedi.
    expect(icerik.adimlar.every((a) => a.dogrulandi === false)).toBe(true);
  });

  it("geçerli adım kabul edilir", () => {
    expect(AdimSemasi.safeParse(gecerliAdim).success).toBe(true);
  });

  it("kaynağı olmayan adım reddedilir", () => {
    expect(AdimSemasi.safeParse(alansiz("kaynak")).success).toBe(false);
    expect(AdimSemasi.safeParse({ ...gecerliAdim, kaynak: [] }).success).toBe(false);
  });

  it("son kontrol tarihi olmayan adım reddedilir", () => {
    expect(AdimSemasi.safeParse(alansiz("son_kontrol")).success).toBe(false);
    expect(AdimSemasi.safeParse({ ...gecerliAdim, son_kontrol: "28.09.2026" }).success).toBe(false);
  });

  it("dogrulandi alanı olmayan adım reddedilir", () => {
    expect(AdimSemasi.safeParse(alansiz("dogrulandi")).success).toBe(false);
  });

  it("koşulda bilinmeyen soru veya değer reddedilir", () => {
    expect(KosulSemasi.safeParse({ borc: "evet" }).success).toBe(true);
    expect(KosulSemasi.safeParse({ borcc: "evet" }).success).toBe(false);
    expect(KosulSemasi.safeParse({ borc: "belki" }).success).toBe(false);
    expect(KosulSemasi.safeParse({ any: [{ borc: "evet" }, { varliklar: "yat" }] }).success).toBe(false);
  });

  it("geçersiz içerik dosyası yüklemeyi (ve build'i) kırar", () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), "vefa-icerik-"));
    fs.cpSync(path.join(process.cwd(), "content"), gecici, { recursive: true });
    const dosya = path.join(gecici, "adimlar", "1_ilk_hafta.yaml");
    fs.writeFileSync(dosya, fs.readFileSync(dosya, "utf8").replace(/^ {2}son_kontrol:.*$/m, ""));
    expect(() => icerikYukle(gecici)).toThrow(/son_kontrol/);
    fs.rmSync(gecici, { recursive: true, force: true });
  });
});
