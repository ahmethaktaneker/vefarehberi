"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ANAHTARLAR, jsonCoz, useDepo } from "@/lib/depo";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";
import { akisTamam, type Cevaplar } from "@/lib/sorular";

type MenuOgesi = { href: string; ad: string; aciklama: string };

const MENU: MenuOgesi[] = [
  { href: "/rehber", ad: "Rehberler", aciklama: "Reddi miras, cenaze ödeneği, ölüm aylığı ve daha fazlası" },
  { href: "/hesaplayici/veraset-vergisi", ad: "Veraset vergisi hesaplayıcı", aciklama: "Size vergi çıkar mı, yaklaşık ne kadar?" },
  { href: "/sablonlar", ad: "Dilekçe taslakları", aciklama: "Banka ve abonelik dilekçelerini doldurup yazdırın" },
  { href: "/ilk-48-saat", ad: "İlk 48 saat", aciklama: "İlk günlerde yapılması gerekenler" },
  { href: "/yurtdisi", ad: "Yurtdışında yaşıyorum", aciklama: "Vekaletname, süreler, konsolosluk" },
  { href: "/sozluk", ad: "Sözlük", aciklama: "Zor terimlerin kısa açıklamaları" },
];

/** app/layout.tsx içindeki ilk boyama betiği de bu anahtarı okur. */
const YAZI_ANAHTARI = "vefa:yazi:v1";

function yaziAbone(f: () => void) {
  window.addEventListener("vefa-yazi", f);
  return () => window.removeEventListener("vefa-yazi", f);
}

function useBuyukYazi(): [boolean, () => void] {
  const buyuk = useSyncExternalStore(
    yaziAbone,
    () => document.documentElement.dataset.yazi === "buyuk",
    () => false,
  );
  function degistir() {
    const yeni = buyuk ? "normal" : "buyuk";
    document.documentElement.dataset.yazi = yeni;
    try {
      localStorage.setItem(YAZI_ANAHTARI, yeni);
    } catch {}
    window.dispatchEvent(new Event("vefa-yazi"));
  }
  return [buyuk, degistir];
}

/** Üst bölüm: logo, her zaman bir dokunuşla "Listem", açılır menü ve yazı boyutu. */
export function SiteHeader() {
  const yol = usePathname();
  const [menuAcik, setMenuAcik] = useState(false);
  const [buyuk, yaziDegistir] = useBuyukYazi();
  const ham = useDepo(ANAHTARLAR.cevaplar);
  const listeVar = useMemo(() => akisTamam(jsonCoz<Cevaplar>(ham, {})), [ham]);
  const listeHref = listeVar ? "/liste/sonuc" : "/liste";
  const listedeyiz = yol.startsWith("/liste");

  useEffect(() => {
    if (!menuAcik) return;
    const kapat = (e: KeyboardEvent) => e.key === "Escape" && setMenuAcik(false);
    window.addEventListener("keydown", kapat);
    return () => window.removeEventListener("keydown", kapat);
  }, [menuAcik]);

  const aktif = (href: string) => yol === href || yol.startsWith(href + "/");

  return (
    <header className="border-b border-cizgi bg-zemin">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" onClick={() => setMenuAcik(false)} className="min-w-0 rounded-md no-underline">
          <span className="block font-serif text-xl font-semibold text-vurgu-koyu">{URUN_ADI}</span>
          <span className="block text-base leading-snug text-metin-ikincil">{URUN_ALT_BASLIK}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={listeHref}
            onClick={() => setMenuAcik(false)}
            aria-current={listedeyiz ? "page" : undefined}
            className={`inline-flex min-h-12 items-center rounded-lg px-4 text-base font-semibold ${
              listedeyiz ? "bg-vurgu-acik text-vurgu-koyu ring-1 ring-vurgu" : "bg-vurgu text-white hover:bg-vurgu-koyu"
            }`}
          >
            {listeVar ? "Listem" : "Başla"}
          </Link>
          <button
            type="button"
            onClick={() => setMenuAcik(!menuAcik)}
            aria-expanded={menuAcik}
            aria-controls="ana-menu"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-cizgi bg-yuzey px-3 text-base font-semibold text-vurgu-koyu hover:border-vurgu"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {menuAcik ? "×" : "☰"}
            </span>
            {menuAcik ? "Kapat" : "Menü"}
          </button>
        </div>
      </div>

      {menuAcik && (
        <nav id="ana-menu" aria-label="Ana menü" className="border-t border-cizgi bg-yuzey">
          <ul className="mx-auto max-w-3xl divide-y divide-cizgi px-4 sm:px-6">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  onClick={() => setMenuAcik(false)}
                  aria-current={aktif(m.href) ? "page" : undefined}
                  className="flex min-h-16 items-center gap-3 py-3"
                >
                  <span className="flex-1">
                    <span className={`block text-lg ${aktif(m.href) ? "font-semibold text-vurgu-koyu" : "font-semibold"}`}>{m.ad}</span>
                    <span className="block text-base text-metin-ikincil">{m.aciklama}</span>
                  </span>
                  <span aria-hidden="true" className="text-vurgu-koyu">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li className="py-3">
              <button
                type="button"
                onClick={yaziDegistir}
                aria-pressed={buyuk}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-cizgi px-4 text-left text-lg hover:border-vurgu"
              >
                <span>
                  <span aria-hidden="true" className="mr-2 font-serif font-semibold">
                    A<span className="text-xl">A</span>
                  </span>
                  Yazı boyutu
                </span>
                <span className="font-semibold text-vurgu-koyu">{buyuk ? "Büyük" : "Normal"}</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
