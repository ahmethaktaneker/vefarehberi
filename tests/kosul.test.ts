import { describe, expect, it } from "vitest";
import { kosulSaglaniyor } from "@/lib/kurallar/kosul";

const c = { borc: "evet", varliklar: ["banka", "arac"] };

describe("kosulSaglaniyor", () => {
  it("koşul yoksa her zaman doğru", () => {
    expect(kosulSaglaniyor(undefined, c)).toBe(true);
  });
  it("tek değer eşitliği", () => {
    expect(kosulSaglaniyor({ borc: "evet" }, c)).toBe(true);
    expect(kosulSaglaniyor({ borc: "hayir" }, c)).toBe(false);
  });
  it("değer listesi", () => {
    expect(kosulSaglaniyor({ borc: ["evet", "bilmiyorum"] }, c)).toBe(true);
  });
  it("çoklu seçimde kesişim", () => {
    expect(kosulSaglaniyor({ varliklar: "arac" }, c)).toBe(true);
    expect(kosulSaglaniyor({ varliklar: ["kredi", "sirket"] }, c)).toBe(false);
  });
  it("cevaplanmamış soru koşulu sağlamaz", () => {
    expect(kosulSaglaniyor({ abonelikler: "elektrik" }, c)).toBe(false);
  });
  it("all / any / not", () => {
    expect(kosulSaglaniyor({ all: [{ borc: "evet" }, { varliklar: "banka" }] }, c)).toBe(true);
    expect(kosulSaglaniyor({ all: [{ borc: "evet" }, { varliklar: "kredi" }] }, c)).toBe(false);
    expect(kosulSaglaniyor({ any: [{ borc: "hayir" }, { varliklar: "banka" }] }, c)).toBe(true);
    expect(kosulSaglaniyor({ not: { borc: "evet" } }, c)).toBe(false);
  });
});
