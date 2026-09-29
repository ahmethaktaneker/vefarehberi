"use client";

import { hrefGorunur, hrefPakette } from "@/lib/araclar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ANAHTARLAR, jsonCoz, useDepo } from "@/lib/depo";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";
import { akisTamam, type Cevaplar } from "@/lib/sorular";

type MenuOgesi = { href: string; ad: string; aciklama: string };

/** Menü iki gruptur. Araçlar, süresi en yakın işten başlayarak sıralanır (ana sayfayla aynı sıra). */
const MENU: { baslik: string; ogeler: MenuOgesi[] }[] = [
  {
    baslik: "Araçlar",
    ogeler: [
      { href: "/reddi-miras", ad: "Mirası reddetmeli miyim?", aciklama: "Varlık ve borçları karşılaştırın, kalan süreyi görün" },
      { href: "/beyanname", ad: "Beyanname formu", aciklama: "Veraset beyannamesini doldurup yazdırın" },
      { href: "/hesaplayici/miras-payi", ad: "Miras payı hesaplayıcı", aciklama: "Kime, ne oranda kalır?" },
      { href: "/hesaplayici/olum-ayligi", ad: "Ölüm aylığı hesaplayıcı", aciklama: "Eşe ve çocuklara ne kadar bağlanır?" },
      { href: "/hesaplayici/veraset-vergisi", ad: "Veraset vergisi hesaplayıcı", aciklama: "Size vergi çıkar mı, ne kadar?" },
      { href: "/sablonlar", ad: "Dilekçe taslakları", aciklama: "Doldurup yazdırın" },
      { href: "/kurum-ziyaret", ad: "Kurum ziyaret sayfaları", aciklama: "Her kurum için ne götürülecek, ne denecek" },
    ],
  },
  {
    baslik: "Rehberler",
    ogeler: [
      { href: "/rehber/vefat-sonrasi-yapilacak-islemler", ad: "Vefat sonrası yapılacak işlemler", aciklama: "Sırasıyla ve son tarihleriyle" },
      { href: "/ilk-48-saat", ad: "İlk 48 saat", aciklama: "Ölüm belgesi, cenaze ve defin" },
      { href: "/yurtdisi", ad: "Yurtdışında yaşıyorum", aciklama: "Vekaletname, süreler, konsolosluk" },
      { href: "/sozluk", ad: "Sözlük", aciklama: "Zor terimlerin kısa açıklamaları" },
      { href: "/rehber", ad: "Tüm rehberler", aciklama: "Reddi miras, cenaze ödeneği, ölüm aylığı ve daha fazlası" },
    ],
  },
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

  const aktif = (href: string) => yol === href;

  return (
    <header className="relative z-50 bg-vurgu-koyu text-white shadow-[0_4px_14px_rgb(10_25_45/0.3)]">
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
        <>
          {/* Menünün dışına dokununca kapanır */}
          <button
            type="button"
            aria-label="Menüyü kapat"
            tabIndex={-1}
            onClick={() => setMenuAcik(false)}
            className="fixed inset-0 top-[var(--baslik-yuksekligi,4.5rem)] -z-10 cursor-default bg-vurgu-koyu/40"
          />
          <nav
            id="ana-menu"
            aria-label="Ana menü"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-yuzey text-metin shadow-yuksek"
          >
            <div className="mx-auto grid max-w-4xl gap-x-8 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-6">
              {MENU.map((grup) => (
                <section key={grup.baslik} aria-labelledby={`menu-${grup.baslik}`}>
                  <h2 id={`menu-${grup.baslik}`} className="px-3 pb-1 font-serif text-lg font-semibold text-altin-koyu">
                    {grup.baslik}
                  </h2>
                  <ul>
                    {grup.ogeler
                      .filter((m) => hrefGorunur(m.href))
                      .map((m) => (
                        <li key={m.href}>
                          <Link
                            href={m.href}
                            onClick={() => setMenuAcik(false)}
                            aria-current={aktif(m.href) ? "page" : undefined}
                            className={`flex min-h-12 flex-col justify-center rounded-xl px-3 py-2 hover:bg-zemin ${aktif(m.href) ? "bg-vurgu-acik" : ""}`}
                          >
                            <span className="flex flex-wrap items-center gap-2 text-lg font-bold leading-snug text-vurgu-koyu">
                              {m.ad}
                              {hrefPakette(m.href) && (
                                <span className="rounded-full bg-altin-acik px-2 py-0.5 text-sm font-normal text-altin-koyu">Pakette</span>
                              )}
                            </span>
                            <span className="text-base leading-snug text-metin-ikincil">{m.aciklama}</span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
              <div className="flex flex-col gap-2 border-t border-cizgi pt-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={yaziDegistir}
                  aria-pressed={buyuk}
                  className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-cizgi bg-zemin px-4 text-left text-lg hover:border-vurgu sm:min-w-72"
                >
                  <span>
                    <span aria-hidden="true" className="mr-2 font-serif font-semibold">
                      A<span className="text-xl">A</span>
                    </span>
                    Yazı boyutu
                  </span>
                  <span className="font-bold text-vurgu">{buyuk ? "Büyük" : "Normal"}</span>
                </button>
                <Link
                  href="/hakkimizda"
                  onClick={() => setMenuAcik(false)}
                  className="inline-flex min-h-12 items-center px-3 text-lg text-vurgu-koyu underline underline-offset-4"
                >
                  Hakkımızda ve iletişim
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

/**
 * Marka logosu. public/logo.png'den keskin küçültülmüş sürümler (scripts/logo-kucult.mjs); Next'in yeniden
 * sıkıştırması logoyu bulanıklaştırdığı için dosyalar olduğu gibi sunulur, tarayıcı ekran yoğunluğuna göre seçer.
 */
function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-88.png"
      srcSet="/logo-88.png 2x, /logo-132.png 3x"
      alt=""
      width={44}
      height={44}
      fetchPriority="high"
      className="size-10 shrink-0 rounded-[9px] sm:size-11"
    />
  );
}
