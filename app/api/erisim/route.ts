import { cookies } from "next/headers";
import { z } from "zod";
import { ERISIM_CEREZI, kodNormalle, kodUrunleri } from "@/lib/erisim";

const Istek = z.strictObject({ kod: z.string().max(64) });
const BIR_YIL_SN = 60 * 60 * 24 * 365;

/** Erişim kodunu doğrular, geçerliyse çereze yazar. Tahmin denemelerini yavaşlatmak için hatada bekler. */
export async function POST(request: Request) {
  const govde = Istek.safeParse(await request.json().catch(() => null));
  if (!govde.success) return Response.json({ hata: "gecersiz" }, { status: 400 });

  const urunler = kodUrunleri(govde.data.kod);
  if (urunler.length === 0) {
    await new Promise((r) => setTimeout(r, 800));
    return Response.json({ hata: "kod" }, { status: 403 });
  }

  (await cookies()).set(ERISIM_CEREZI, kodNormalle(govde.data.kod), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BIR_YIL_SN,
  });
  return Response.json({ tamam: true, urunler });
}
