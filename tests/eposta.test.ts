import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/paket-ilgi/route";
import { epostaTemizle } from "@/lib/eposta";
import { kvkkYukle } from "@/lib/kvkk";

const surum = kvkkYukle().acik_riza.paket_ilgi.surum;
const istek = (govde: unknown) =>
  POST(new Request("http://localhost/api/paket-ilgi", { method: "POST", body: JSON.stringify(govde) }));

describe("e-posta toplama", () => {
  it("e-posta doğrulama ve küçük harfe çevirme", () => {
    expect(epostaTemizle(" Ayse@Ornek.com ")).toBe("ayse@ornek.com");
    expect(epostaTemizle("ayse@ornek")).toBeNull();
    expect(epostaTemizle("ayse ornek.com")).toBeNull();
  });

  it("rıza olmadan, geçersiz paketle veya eski rıza sürümüyle kayıt yapılmaz", async () => {
    const temel = { eposta: "a@ornek.com", paket: "beyanname", riza: true, riza_surumu: surum };
    expect((await istek({ ...temel, riza: false })).status).toBe(400);
    expect((await istek({ ...temel, paket: "takip" })).status).toBe(400);
    expect((await istek({ ...temel, riza_surumu: "eski" })).status).toBe(400);
    expect((await istek({ ...temel, eposta: "gecersiz" })).status).toBe(400);
    expect((await istek({ ...temel, ek_alan: "x" })).status).toBe(400);
  });

  it("veritabanı bağlı değilken 503 döner", async () => {
    const r = await istek({ eposta: "a@ornek.com", paket: "aile", riza: true, riza_surumu: surum });
    expect(r.status).toBe(503);
  });

  it("bot tuzağı dolu gelirse kaydetmeden başarılı görünür", async () => {
    const r = await istek({ eposta: "a@ornek.com", paket: "aile", riza: true, riza_surumu: surum, site: "spam" });
    expect(r.status).toBe(200);
  });
});
