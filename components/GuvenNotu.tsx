"use client";

import Link from "next/link";
import { useDepo, yaz } from "@/lib/depo";

const ANAHTAR = "vefa:guven-notu:v1";

/**
 * İlk ziyarette ekranın altında beliren, sayfayı kapatmayan güven notu. "Anladım"a basılınca bir daha
 * gösterilmez. Kaş kaldıran bir açılır pencere yerine bilinçli olarak küçük ve kapatılabilir.
 */
export function GuvenNotu() {
  const goruldu = useDepo(ANAHTAR);
  if (goruldu !== null) return null; // undefined: henüz okunmadı; "1": kapatıldı

  return (
    <div role="region" aria-label="Gizlilik" className="bir-kez-yuksel fixed inset-x-0 bottom-0 z-40 px-3 pb-3 print:hidden sm:px-6 sm:pb-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-cizgi bg-yuzey p-4 shadow-yuksek sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <span aria-hidden="true" className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-vurgu-acik text-vurgu-koyu sm:inline-flex">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
        <p className="flex-1 text-base">
          <strong className="block text-vurgu-koyu">Kimlik bilgilerinizi istemiyoruz.</strong>
          Listenizi çıkarmak için adınızı, T.C. kimlik numaranızı ya da telefonunuzu sormuyoruz. Yazdığınız her şey yalnızca bu
          cihazda kalır, bize gönderilmez.{" "}
          <Link href="/gizlilik" className="baglanti">
            Nasıl?
          </Link>
        </p>
        <button type="button" onClick={() => yaz(ANAHTAR, "1")} className="dugme dugme-birincil min-h-11 shrink-0 px-5 py-2 text-base">
          Anladım
        </button>
      </div>
    </div>
  );
}
