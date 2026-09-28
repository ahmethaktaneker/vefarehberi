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

/**
 * Umami (çerezsiz analitik) site kimliği. Gizli değildir; sayfa kaynağında herkese görünür.
 * Boş bırakılırsa analitik betiği yüklenmez.
 */
export const UMAMI_SITE_KIMLIGI = "6fd3f51a-07b7-4236-b40a-afb4401f54db";

/**
 * Takip Paketi için e-posta bırakma formu açık mı? Veritabanı Vercel'e bağlanınca true yapılır.
 */
export const EPOSTA_TOPLAMA_AKTIF = true;

/** Sayfa başlığı kalıbı: "{Konu} | Vefa Rehberi" */
export function sayfaBasligi(konu: string): string {
  return `${konu} | ${URUN_ADI}`;
}
