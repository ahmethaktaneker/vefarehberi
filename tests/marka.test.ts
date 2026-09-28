import { describe, expect, it } from "vitest";
import { SITE_URL, URUN_ADI, URUN_ALT_BASLIK, sayfaBasligi } from "@/lib/marka";

describe("marka sabitleri", () => {
  it("ürün adı ve alt başlık doğru", () => {
    expect(URUN_ADI).toBe("Vefat Rehberi");
    expect(URUN_ALT_BASLIK).toBe("Vefat sonrası işlemler, adım adım");
  });
  it("kanonik adres www'suz ve https", () => {
    expect(SITE_URL).toBe("https://vefatrehberi.com");
  });
  it("sayfa başlığı kalıbı", () => {
    expect(sayfaBasligi("Gizlilik")).toBe("Gizlilik | Vefat Rehberi");
  });
});
