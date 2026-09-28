import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL, UMAMI_SITE_KIMLIGI, URUN_ADI, URUN_ALT_BASLIK, YAYINDA } from "@/lib/marka";

const govde = Source_Sans_3({
  variable: "--font-govde",
  subsets: ["latin", "latin-ext"],
});

const baslik = Source_Serif_4({
  variable: "--font-baslik",
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
  robots: YAYINDA ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
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
        {UMAMI_SITE_KIMLIGI && (
          // Çerezsiz analitik (Brief 11). Yalnızca olay sayıları; kişisel veri ve cevap içeriği gönderilmez.
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={UMAMI_SITE_KIMLIGI}
            data-do-not-track="true"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
