import { describe, expect, it } from "vitest";
import { csp } from "@/lib/csp";
import { epostaTemizle, inboxGovdesi } from "@/lib/eposta";
import { INBOX_EPOSTA_ALANI, INBOX_FORM_ADRESI } from "@/lib/marka";

describe("e-posta toplama (INBOX)", () => {
  it("e-posta doğrulama ve küçük harfe çevirme", () => {
    expect(epostaTemizle(" Ayse@Ornek.com ")).toBe("ayse@ornek.com");
    expect(epostaTemizle("ayse@ornek")).toBeNull();
    expect(epostaTemizle("ayse ornek.com")).toBeNull();
  });

  it("INBOX'a yalnızca e-posta adresi, formun alan adıyla gönderilir", () => {
    const govde = inboxGovdesi("ayse@ornek.com", INBOX_EPOSTA_ALANI);
    expect([...govde.keys()]).toEqual(["cf_0"]);
    expect(govde.get("cf_0")).toBe("ayse@ornek.com");
    expect(INBOX_FORM_ADRESI).toMatch(/^https:\/\/joinbox\.today\/form\//);
  });

  it("güvenlik politikası (CSP) INBOX form adresine bağlanmaya izin verir", () => {
    const connect = csp.split("; ").find((d) => d.startsWith("connect-src ")) ?? "";
    expect(connect.split(" ")).toContain("https://joinbox.today");
  });
});
