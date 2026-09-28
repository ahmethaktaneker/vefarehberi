/** Ürün adı ve alt başlık. Sitede her yerde buradan okunur. */
export const URUN_ADI = "Vefa Rehberi";
export const URUN_ALT_BASLIK = "Vefat sonrası işlemler, adım adım";

/** Kanonik adres (www'suz, HTTPS). */
export const SITE_URL = "https://vefarehberi.com";

/**
 * Site herkese açık yayına hazır mı?
 * false iken tüm sayfalar noindex, robots.txt her şeyi engeller.
 */
export const YAYINDA = false;

/**
 * "Hukuk uzmanı kontrolünde hazırlanır" rozeti.
 * İçerik avukat kontrolünden geçene kadar kapalı kalır (Brief 5.1).
 */
export const AVUKAT_ROZETI_AKTIF = false;

/** Sayfa başlığı kalıbı: "{Konu} | Vefa Rehberi" */
export function sayfaBasligi(konu: string): string {
  return `${konu} | ${URUN_ADI}`;
}
