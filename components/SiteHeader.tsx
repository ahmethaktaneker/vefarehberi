"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ANAHTARLAR, jsonCoz, useDepo } from "@/lib/depo";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";
import { akisTamam, type Cevaplar } from "@/lib/sorular";

type MenuOgesi = { href: string; ad: string; aciklama: string };

const MENU: MenuOgesi[] = [
  { href: "/rehber", ad: "Rehberler", aciklama: "Reddi miras, cenaze ödeneği, ölüm aylığı ve daha fazlası" },
  { href: "/hesaplayici/miras-payi", ad: "Miras payı hesaplayıcı", aciklama: "Eş, çocuklar, anne-baba ve kardeşlerin yasal payları" },
  { href: "/hesaplayici/veraset-vergisi", ad: "Veraset vergisi hesaplayıcı", aciklama: "Size vergi çıkar mı, yaklaşık ne kadar?" },
  { href: "/beyanname", ad: "Beyanname formu doldurma", aciklama: "Resmi veraset beyannamesini doldurup yazdırın" },
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
    <header className="relative z-20 bg-vurgu-koyu text-white shadow-[0_4px_14px_rgb(10_25_45/0.3)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <Link href="/" onClick={() => setMenuAcik(false)} className="flex min-w-0 items-center gap-2 rounded-md no-underline sm:gap-3">
          <Logo />
          <span className="min-w-0">
            <span className="block font-serif text-lg font-semibold leading-tight whitespace-nowrap sm:text-xl">{URUN_ADI}</span>
            <span className="block text-[0.9375rem] leading-snug text-white/80 sm:text-base">{URUN_ALT_BASLIK}</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href={listeHref}
            onClick={() => setMenuAcik(false)}
            aria-current={listedeyiz ? "page" : undefined}
            className={`inline-flex min-h-12 items-center rounded-xl px-3 text-base font-bold transition-colors sm:px-4 ${
              listedeyiz ? "bg-white/15 text-white ring-1 ring-white/50" : "bg-altin text-vurgu-koyu hover:bg-[#d6b574]"
            }`}
          >
            {listeVar ? "Listem" : "Başla"}
          </Link>
          <button
            type="button"
            onClick={() => setMenuAcik(!menuAcik)}
            aria-expanded={menuAcik}
            aria-controls="ana-menu"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/40 px-3 text-base font-bold text-white hover:bg-white/10"
          >
            <span aria-hidden="true" className="hidden text-xl leading-none sm:inline">
              {menuAcik ? "×" : "☰"}
            </span>
            {menuAcik ? "Kapat" : "Menü"}
          </button>
        </div>
      </div>

      {menuAcik && (
        <nav id="ana-menu" aria-label="Ana menü" className="absolute inset-x-0 top-full border-t border-white/10 bg-yuzey text-metin shadow-yuksek">
          <ul className="mx-auto grid max-w-4xl gap-x-6 px-4 py-2 sm:grid-cols-2 sm:px-6 sm:py-4">
            {MENU.map((m) => (
              <li key={m.href} className="border-b border-cizgi sm:border-b-0">
                <Link
                  href={m.href}
                  onClick={() => setMenuAcik(false)}
                  aria-current={aktif(m.href) ? "page" : undefined}
                  className="flex min-h-16 flex-col justify-center rounded-xl py-3 sm:px-3 sm:hover:bg-zemin"
                >
                  <span className={`text-lg font-bold ${aktif(m.href) ? "text-vurgu underline underline-offset-4" : "text-vurgu-koyu"}`}>{m.ad}</span>
                  <span className="text-base text-metin-ikincil">{m.aciklama}</span>
                </Link>
              </li>
            ))}
            <li className="py-3 sm:col-span-2 sm:px-3">
              <button
                type="button"
                onClick={yaziDegistir}
                aria-pressed={buyuk}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-cizgi bg-zemin px-4 text-left text-lg hover:border-vurgu"
              >
                <span>
                  <span aria-hidden="true" className="mr-2 font-serif font-semibold">
                    A<span className="text-xl">A</span>
                  </span>
                  Yazı boyutu
                </span>
                <span className="font-bold text-vurgu">{buyuk ? "Büyük" : "Normal"}</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/** Marka logosu (public/logo.png). */
function Logo() {
  return <Image src="/logo.png" alt="" width={44} height={44} priority className="size-10 shrink-0 rounded-[9px] sm:size-11" />;
}
