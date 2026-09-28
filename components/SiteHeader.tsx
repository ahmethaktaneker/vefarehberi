import Link from "next/link";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";

/** Yazı logo: marka adı ve altında alt başlık (Brief 14a). */
export function SiteHeader() {
  return (
    <header className="border-b border-cizgi bg-zemin">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link href="/" className="inline-block no-underline">
          <span className="block font-serif text-xl font-semibold text-vurgu-koyu">{URUN_ADI}</span>
          <span className="block text-sm text-metin-ikincil">{URUN_ALT_BASLIK}</span>
        </Link>
      </div>
    </header>
  );
}
