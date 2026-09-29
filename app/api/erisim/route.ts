import { cookies } from "next/headers";
import { z } from "zod";
import { ERISIM_CEREZI, kodNormalle, kodUrunleri } from "@/lib/erisim";
import { baskaSitedenMi, hizSiniri, jsonGovde } from "@/lib/sunucu/guvenlik";

const Istek = z.strictObject({ kod: z.string().max(64) });
const BIR_YIL_SN = 60 * 60 * 24 * 365;

/**
 * Erişim kodunu doğrular, geçerliyse çereze yazar. Tahmin denemeleri IP başına dağıtık hız sınırıyla
 * kısıtlanır (Upstash Ratelimit); sabit bekleme tek başına paralel denemeleri durdurmaz.
 */
export async function POST(request: Request) {
  if (baskaSitedenMi(request)) return Response.json({ hata: "kaynak" }, { status: 403 });
  try {
    const sinir = await hizSiniri(request, "erisim", 10, "15 m");
    if (sinir) return sinir;
  } catch {
    return Response.json({ hata: "gecici" }, { status: 503 });
  }
  const govdeSonucu = await jsonGovde(request, 512);
  if ("yanit" in govdeSonucu) return govdeSonucu.yanit;
  const govde = Istek.safeParse(govdeSonucu.veri);
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
