import Link from "next/link";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";

/** Yazı logo: marka adı ve altında alt başlık (Brief 14a). */
export function SiteHeader() {
  return (
    <header className="border-b border-cizgi bg-zemin">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
        <Link href="/" className="inline-block no-underline">
          <span className="block font-serif text-xl font-semibold text-vurgu-koyu">{URUN_ADI}</span>
          <span className="block text-sm text-metin-ikincil">{URUN_ALT_BASLIK}</span>
        </Link>
        <nav aria-label="Ana menü">
          <ul className="flex gap-4 text-base">
            <li>
              <Link href="/liste" className="text-vurgu-koyu underline-offset-4 hover:underline">
                Listem
              </Link>
            </li>
            <li>
              <Link href="/hesaplayici/veraset-vergisi" className="text-vurgu-koyu underline-offset-4 hover:underline">
                Vergi hesapla
              </Link>
            </li>
            <li>
              <Link href="/sablonlar" className="text-vurgu-koyu underline-offset-4 hover:underline">
                Dilekçeler
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
