import { Redis } from "@upstash/redis";
import { z } from "zod";
import { epostaTemizle } from "@/lib/eposta";
import { kvkkYukle } from "@/lib/kvkk";

/**
 * Paketler için e-posta bırakma (Brief 10, 12). Yalnızca e-posta, ilgilenilen paket, tarih ve
 * rıza sürümü saklanır. Kayıt 12 ay sonra kendiliğinden silinir (aydınlatma metni).
 */

const SAKLAMA_SN = 60 * 60 * 24 * 365;

const Istek = z.strictObject({
  eposta: z.string(),
  paket: z.enum(["beyanname", "aile", "yenilikler"]),
  riza: z.literal(true),
  riza_surumu: z.string(),
  site: z.string().optional(),
});

function redis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function POST(request: Request) {
  const govde = Istek.safeParse(await request.json().catch(() => null));
  if (!govde.success) return Response.json({ hata: "gecersiz" }, { status: 400 });
  const { eposta, paket, riza_surumu, site } = govde.data;

  // Bot tuzağı: sessizce başarılı görün.
  if (site) return Response.json({ tamam: true });

  const temiz = epostaTemizle(eposta);
  if (!temiz) return Response.json({ hata: "eposta" }, { status: 400 });
  if (riza_surumu !== kvkkYukle().acik_riza.paket_ilgi.surum) return Response.json({ hata: "riza" }, { status: 400 });

  const db = redis();
  if (!db) return Response.json({ hata: "hazir_degil" }, { status: 503 });

  const anahtar = `paket_ilgi:${temiz}`;
  await db.hset(anahtar, { paket, tarih: new Date().toISOString(), riza_surumu });
  await db.expire(anahtar, SAKLAMA_SN);
  return Response.json({ tamam: true });
}
