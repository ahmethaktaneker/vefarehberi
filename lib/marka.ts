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
 * İçerik avukat kontrolünden geçene kadar kapalı kalır.
 */
export const AVUKAT_ROZETI_AKTIF = true;

/**
 * Umami (çerezsiz analitik) site kimliği. Gizli değildir; sayfa kaynağında herkese görünür.
 * Boş bırakılırsa analitik betiği yüklenmez.
 */
export const UMAMI_SITE_KIMLIGI = "6fd3f51a-07b7-4236-b40a-afb4401f54db";
/**
 * Umami betiğinin ayarları. Paylaşım linkleri cevapları adresin #p=... kısmında taşır; Umami varsayılan
 * olarak adresin tamamını gönderdiği için # ve ? kısımları ölçümden çıkarılır.
 */
export const UMAMI_BETIK_AYARLARI = {
  "data-do-not-track": "true",
  "data-exclude-hash": "true",
  "data-exclude-search": "true",
} as const;

/**
 * Paketler için e-posta bırakma formu açık mı? Veritabanı Vercel'e bağlanınca true yapılır.
 */
export const EPOSTA_TOPLAMA_AKTIF = true;
/**
 * E-posta listesi INBOX'ta (useinbox.com; INBOX'ın açıklamasına göre sunucuları Türkiye'de). Form, adresi
 * tarayıcıdan doğrudan INBOX'ın web formu adresine gönderir; site sunucusuna ve başka bir veritabanına
 * uğramaz. Adres ve alan adı, INBOX panelindeki "Vefat Rehberi" web formunun yerleştirme kodundan alındı.
 */
export const INBOX_FORM_ADRESI = "https://joinbox.today/form/6abc02e5d2a8a60001835ab2/6abc03c05177fb2d30a0a24d";
export const INBOX_EPOSTA_ALANI = "cf_0";

/**
 * "Kontrol ediliyor" rozetleri ve "hukuk uzmanı kontrolünden geçmedi" notları.
 * Proje sahibinin kararıyla kapalı; içerik avukat kontrolünden geçene kadar yayına almadan önce
 * yeniden değerlendirilecek. true yapılınca tüm rozetler geri gelir.
 */
export const KONTROL_ROZETLERI = false;

/**
 * Ücretli araçlar (şimdilik beyanname hazırlık aracı) erişim kodu ister. false yapılırsa herkese açılır.
 * Kodlar: content/erisim.yaml, üretmek için npm run kod-uret.
 */
export const UCRETLI_KILIT_AKTIF = false;

/**
 * Paket tanıtımları: liste sayfasındaki paket kartı, "Pakette" etiketleri ve kilitli araçlara giden tüm
 * bağlantılar (menü, sayfa altı, adım ayrıntıları, araç önerileri). false yapılınca hepsi kaybolur;
 * kilitli araç sayfaları yalnızca adresi bilenlere açık kalır.
 */
export const PAKET_TANITIMI_AKTIF = false;

/**
 * Şimdilik gizlenen sayfalar: menüden, sayfa altından, adımlardan ve önerilerden kalkar; adresleri
 * "sayfa bulunamadı" verir. Kod duruyor; listeden çıkarılınca geri gelir.
 */
export const GIZLI_SAYFALAR: readonly string[] = ["/sozluk", "/kurum-ziyaret"];
export const sayfaGizli = (yol: string) => GIZLI_SAYFALAR.includes(yol);

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
