import type { NextConfig } from "next";

/**
 * Güvenlik başlıkları. İçerik güvenlik politikası (CSP) yalnızca üretimde uygulanır; geliştirme
 * sunucusunun anlık yenilemesi eval ve websocket kullanır. Dış kaynak olarak yalnızca Umami
 * (çerezsiz ziyaret sayımı) izinlidir: betik cloud.umami.is'ten yüklenir, veri gateway.umami.is'e gider.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is",
  "connect-src 'self' https://cloud.umami.is https://gateway.umami.is",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const guvenlikBasliklari = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: guvenlikBasliklari }];
  },
};

export default nextConfig;
