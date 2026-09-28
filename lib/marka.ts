/** Ürün adı ve alt başlık. Sitede her yerde buradan okunur. */
export const URUN_ADI = "Vefat Rehberi";
export const URUN_ALT_BASLIK = "Vefat sonrası işlemler, adım adım";

/** Kanonik adres (www'suz, HTTPS). */
export const SITE_URL = "https://vefatrehberi.com";

/**
 * Site herkese açık yayına hazır mı?
 * false iken tüm sayfalar noindex, robots.txt her şeyi engeller.
 */
export const YAYINDA = false;

/**
 * "Hukuk uzmanı kontrolünde hazırlanır" rozeti.
 * İçerik avukat kontrolünden geçene kadar kapalı kalır (Brief 5.1).
 */
export const AVUKAT_ROZETI_AKTIF = true;

/**
 * Umami (çerezsiz analitik) site kimliği. Gizli değildir; sayfa kaynağında herkese görünür.
 * Boş bırakılırsa analitik betiği yüklenmez.
 */
export const UMAMI_SITE_KIMLIGI = "6fd3f51a-07b7-4236-b40a-afb4401f54db";

/**
 * Takip Paketi için e-posta bırakma formu açık mı? Veritabanı Vercel'e bağlanınca true yapılır.
 */
export const EPOSTA_TOPLAMA_AKTIF = true;

/**
 * "Kontrol ediliyor" rozetleri ve "hukuk uzmanı kontrolünden geçmedi" notları (Brief 0.5).
 * Proje sahibinin kararıyla kapalı; içerik avukat kontrolünden geçene kadar yayına almadan önce
 * yeniden değerlendirilecek. true yapılınca tüm rozetler geri gelir.
 */
export const KONTROL_ROZETLERI = false;

/**
 * Ücretli araçlar (şimdilik beyanname hazırlık aracı) erişim kodu ister. false yapılırsa herkese açılır.
 * Kodlar: content/erisim.yaml, üretmek için npm run kod-uret.
 */
export const UCRETLI_KILIT_AKTIF = true;

/** "Bize yazın" bağlantıları için iletişim adresi (aydınlatma metnindeki adresle aynı). */
export const ILETISIM_EPOSTA = "ahmethaktaneker@gmail.com";

/** Hata bildirimi için hazır konu satırlı e-posta bağlantısı. Kişisel bilgi içermez. */
export function hataBildirBaglantisi(konu: string): string {
  return `mailto:${ILETISIM_EPOSTA}?subject=${encodeURIComponent(`Vefat Rehberi: ${konu}`)}`;
}

/** Sayfa başlığı kalıbı: "{Konu} | Vefat Rehberi" */
export function sayfaBasligi(konu: string): string {
  return `${konu} | ${URUN_ADI}`;
}
