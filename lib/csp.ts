/**
 * Güvenlik başlıkları. İçerik güvenlik politikası (CSP) yalnızca üretimde uygulanır; geliştirme
 * sunucusunun anlık yenilemesi eval ve websocket kullanır. Dış kaynak olarak yalnızca Umami
 * (çerezsiz ziyaret sayımı) ve INBOX e-posta formu izinlidir: Umami betiği cloud.umami.is'ten yüklenir, veri
 * gateway.umami.is'e gider; e-posta listesine kayıt joinbox.today'e (INBOX) gönderilir.
 */
export const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is",
  "connect-src 'self' https://cloud.umami.is https://gateway.umami.is https://joinbox.today",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");
