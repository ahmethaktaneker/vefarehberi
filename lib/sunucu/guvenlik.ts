import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * API uçları için ortak korumalar: Redis bağlantısı, dağıtık hız sınırı, istek gövdesi sınırı ve
 * başka sitelerden gelen tarayıcı isteklerinin reddi. Yalnızca sunucuda çalışır.
 */

export function redisBaglantisi(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

/**
 * İstemcinin IP adresi. Vercel bu başlıkları kendisi yazar (istemcinin gönderdiğinin üzerine);
 * başka bir ortamda çalışırken güvenilir bir vekil sunucu arkasında olunmalıdır.
 */
export function istemciIp(request: Request): string {
  const gercek = request.headers.get("x-real-ip")?.trim();
  if (gercek) return gercek;
  const ilk = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ilk || "bilinmiyor";
}

type Sure = `${number} ${"s" | "m" | "h"}`;
const sinirlayicilar = new Map<string, Ratelimit>();

/**
 * Upstash Ratelimit ile IP başına kayan pencere sınırı. Sınır aşılırsa 429 yanıtı döner, aşılmazsa null.
 * Redis tanımlı değilse (yerel geliştirme) sınır uygulanamaz ve null döner; üretimde Redis ortam
 * değişkenleri tanımlı olmalıdır.
 */
export async function hizSiniri(request: Request, ad: string, adet: number, pencere: Sure): Promise<Response | null> {
  const redis = redisBaglantisi();
  if (!redis) return null;
  let sinirlayici = sinirlayicilar.get(ad);
  if (!sinirlayici) {
    sinirlayici = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(adet, pencere), prefix: `hiz:${ad}` });
    sinirlayicilar.set(ad, sinirlayici);
  }
  const { success, reset } = await sinirlayici.limit(istemciIp(request));
  if (success) return null;
  const saniye = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return Response.json({ hata: "cok_istek" }, { status: 429, headers: { "Retry-After": String(saniye) } });
}

/**
 * Başka bir siteden tarayıcı aracılığıyla gönderilen istekleri reddeder (CSRF). Tarayıcılar POST
 * isteklerinde Origin ve Sec-Fetch-Site başlıklarını gönderir; bunlar yoksa istek tarayıcıdan değildir
 * ve hız sınırı ile gövde doğrulaması yine uygulanır.
 */
export function baskaSitedenMi(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

export const GOVDE_SINIRI = 2048;

/** JSON gövdesini boyut sınırıyla okur. Hatalıysa yanıt, doğruysa ayrıştırılmış değer döner. */
export async function jsonGovde(request: Request, sinir = GOVDE_SINIRI): Promise<{ veri: unknown } | { yanit: Response }> {
  const tur = request.headers.get("content-type") ?? "";
  if (!tur.toLowerCase().startsWith("application/json")) return { yanit: Response.json({ hata: "tur" }, { status: 415 }) };
  const uzunluk = Number(request.headers.get("content-length") ?? "0");
  if (uzunluk > sinir) return { yanit: Response.json({ hata: "buyuk" }, { status: 413 }) };
  const metin = await request.text();
  if (metin.length > sinir) return { yanit: Response.json({ hata: "buyuk" }, { status: 413 }) };
  try {
    return { veri: JSON.parse(metin) };
  } catch {
    return { yanit: Response.json({ hata: "gecersiz" }, { status: 400 }) };
  }
}
