import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Atkinson_Hyperlegible, Lora } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { GuvenNotu } from "@/components/GuvenNotu";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL, UMAMI_BETIK_AYARLARI, UMAMI_SITE_KIMLIGI, URUN_ADI, URUN_ALT_BASLIK, YAYINDA } from "@/lib/marka";

/** Metin: az gören okurlar için tasarlanmış, harfleri birbirinden kolay ayrılan yazı tipi. */
const govde = Atkinson_Hyperlegible({
  variable: "--font-govde",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
});

/** Başlıklar: sıcak, okunaklı bir serif. */
const baslik = Lora({
  variable: "--font-baslik",
  weight: ["500", "600"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Vefat Sonrası Yapılacak İşlemler: Size Özel Liste ve Son Tarihler | ${URUN_ADI}`,
    template: `%s | ${URUN_ADI}`,
  },
  description:
    "Vefat sonrası işlemler için size özel yapılacaklar listesi, son tarihler ve hak edebileceğiniz ödemeler. Ücretsiz, kişisel bilgi istemez.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: `${URUN_ADI}: ${URUN_ALT_BASLIK}`,
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: YAYINDA ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f2a47",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${govde.variable} ${baslik.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("vefa:yazi:v1")==="buyuk")document.documentElement.dataset.yazi="buyuk"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-yuzey focus:px-4 focus:py-2"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <GuvenNotu />
        {UMAMI_SITE_KIMLIGI && (
          // Çerezsiz analitik. Adresin # ve ? kısımları gönderilmez (paylaşım linkindeki cevaplar).
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={UMAMI_SITE_KIMLIGI}
            {...UMAMI_BETIK_AYARLARI}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
