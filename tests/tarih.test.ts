import { describe, expect, it } from "vitest";
import { ayEkle, istanbulBugun, kalanGun, tarihGecerli, tarihMetni } from "@/lib/kurallar/tarih";

describe("ayEkle", () => {
  it("normal ay ekleme", () => {
    expect(ayEkle("2026-03-15", 3)).toBe("2026-06-15");
  });
  it("31 Ocak + 1 ay = Şubat'ın son günü", () => {
    expect(ayEkle("2026-01-31", 1)).toBe("2026-02-28");
  });
  it("artık yılda 31 Ocak + 1 ay = 29 Şubat", () => {
    expect(ayEkle("2028-01-31", 1)).toBe("2028-02-29");
  });
  it("31 Ocak + 3 ay = 30 Nisan", () => {
    expect(ayEkle("2026-01-31", 3)).toBe("2026-04-30");
  });
  it("30 Kasım + 3 ay yıl değiştirir", () => {
    expect(ayEkle("2026-11-30", 3)).toBe("2027-02-28");
  });
  it("31 Ağustos + 6 ay = 28 Şubat", () => {
    expect(ayEkle("2026-08-31", 6)).toBe("2027-02-28");
  });
});

describe("kalanGun", () => {
  it("gelecekteki son tarih pozitif", () => {
    expect(kalanGun("2026-10-08", "2026-09-28")).toBe(10);
  });
  it("bugün son gün = 0", () => {
    expect(kalanGun("2026-09-28", "2026-09-28")).toBe(0);
  });
  it("süresi geçmiş negatif", () => {
    expect(kalanGun("2026-09-27", "2026-09-28")).toBe(-1);
  });
  it("yaz saati geçişinden etkilenmez", () => {
    expect(kalanGun("2026-04-01", "2026-03-01")).toBe(31);
    expect(kalanGun("2026-11-01", "2026-10-01")).toBe(31);
  });
});

describe("istanbulBugun", () => {
  it("UTC gece yarısına yakın saatlerde İstanbul tarihini verir", () => {
    // 28 Eylül 22:30 UTC = 29 Eylül 01:30 İstanbul (UTC+3)
    expect(istanbulBugun(new Date("2026-09-28T22:30:00Z"))).toBe("2026-09-29");
    expect(istanbulBugun(new Date("2026-09-28T20:30:00Z"))).toBe("2026-09-28");
  });
});

describe("tarihGecerli / tarihMetni", () => {
  it("geçersiz tarihleri reddeder", () => {
    expect(tarihGecerli("2026-02-30")).toBe(false);
    expect(tarihGecerli("2026-9-1")).toBe(false);
    expect(tarihGecerli(undefined)).toBe(false);
    expect(tarihGecerli("2026-02-28")).toBe(true);
  });
  it("Türkçe tarih metni", () => {
    expect(tarihMetni("2026-12-28")).toBe("28 Aralık 2026");
  });
});
