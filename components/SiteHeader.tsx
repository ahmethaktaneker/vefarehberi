"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";

const MENU: [string, string][] = [
  ["/liste", "Listem"],
  ["/rehber", "Rehberler"],
  ["/hesaplayici/veraset-vergisi", "Vergi hesapla"],
  ["/sablonlar", "Dilekçeler"],
];

/** app/layout.tsx içindeki ilk boyama betiği de bu anahtarı okur. */
const YAZI_ANAHTARI = "vefa:yazi:v1";

function yaziAbone(f: () => void) {
  window.addEventListener("vefa-yazi", f);
  return () => window.removeEventListener("vefa-yazi", f);
}

/** Yazı logo, ana menü ve yazı boyutu düğmesi (Brief 2: kullanıcılar yorgun, çoğu telefondan geliyor). */
export function SiteHeader() {
  const yol = usePathname();
  const buyuk = useSyncExternalStore(
    yaziAbone,
    () => document.documentElement.dataset.yazi === "buyuk",
    () => false,
  );

  function yaziDegistir() {
    const yeni = buyuk ? "normal" : "buyuk";
    document.documentElement.dataset.yazi = yeni;
    try {
      localStorage.setItem(YAZI_ANAHTARI, yeni);
    } catch {}
    window.dispatchEvent(new Event("vefa-yazi"));
  }

  return (
    <header className="border-b border-cizgi bg-zemin">
      <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="inline-block rounded-md no-underline">
            <span className="block font-serif text-xl font-semibold text-vurgu-koyu">{URUN_ADI}</span>
            <span className="block text-base text-metin-ikincil">{URUN_ALT_BASLIK}</span>
          </Link>
          <button
            type="button"
            onClick={yaziDegistir}
            aria-pressed={buyuk}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-cizgi bg-yuzey px-3 text-base text-vurgu-koyu hover:border-vurgu"
          >
            <span aria-hidden="true" className="font-serif font-semibold">
              A<span className="text-lg">A</span>
            </span>
            <span>{buyuk ? "Normal yazı" : "Büyük yazı"}</span>
          </button>
        </div>
        <nav aria-label="Ana menü" className="mt-3 pb-3">
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:gap-1">
            {MENU.map(([href, ad]) => {
              const aktif = yol === href || yol.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={aktif ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border px-3 text-base sm:border-transparent ${
                      aktif ? "border-vurgu bg-vurgu-acik font-semibold text-vurgu-koyu" : "border-cizgi bg-yuzey text-vurgu-koyu hover:bg-bilgi-acik"
                    }`}
                  >
                    {ad}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
