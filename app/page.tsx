import Link from "next/link";
import { AVUKAT_ROZETI_AKTIF } from "@/lib/marka";

export default function AnaSayfa() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 pb-6 sm:px-6 sm:pt-20">
      <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Yakınınızı kaybettiniz. Sırada ne var, birlikte bakalım.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-metin-ikincil">
        Birkaç soruya cevap verin, size özel yapılacaklar listesini, son tarihleri ve hak
        edebileceğiniz ödemeleri görün. Ücretsiz. Kişisel bilgilerinizi istemiyoruz.
      </p>

      <Link
        href="/liste"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-vurgu px-7 py-3 text-lg font-semibold text-white transition-colors hover:bg-vurgu-koyu"
      >
        Listemi oluştur
      </Link>

      <ul className="mt-10 space-y-3 text-base">
        {AVUKAT_ROZETI_AKTIF && (
          <li className="flex gap-3">
            <Isaret />
            Hukuk uzmanı kontrolünde hazırlanır
          </li>
        )}
        <li className="flex gap-3">
          <Isaret />
          Kişisel bilgilerinizi saklamıyoruz
        </li>
      </ul>

      <nav
        aria-label="Diğer rehberler"
        className="mt-12 grid gap-3 border-t border-cizgi pt-8 sm:grid-cols-2"
      >
        <IkincilBaglanti href="/ilk-48-saat" baslik="İlk 48 saat için rehber" />
        <IkincilBaglanti href="/yurtdisi" baslik="Yurtdışında yaşıyorum" />
      </nav>
    </div>
  );
}

function Isaret() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1 size-5 shrink-0 text-vurgu">
      <path
        d="M5 10.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IkincilBaglanti({ href, baslik }: { href: string; baslik: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-cizgi bg-yuzey px-5 py-4 text-base font-semibold text-vurgu-koyu transition-colors hover:border-vurgu"
    >
      {baslik} <span aria-hidden="true">→</span>
    </Link>
  );
}
