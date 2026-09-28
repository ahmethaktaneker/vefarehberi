"use client";

import { useEffect, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import { ANAHTARLAR, useDepo, yaz } from "@/lib/depo";
import type { Paket } from "@/lib/paket";

/**
 * Takip Paketi kartı: ödeme isteği testi (Brief 10). Ekranı kaplamaz, kendiliğinden açılmaz,
 * kapatılabilir. Ziyaretçiye rastgele bir fiyat gösterilir ve hep aynı fiyat gösterilir.
 */
export function PaketKarti({ paket, tetikleyici }: { paket: Paket; tetikleyici: { id: string; metin?: string } }) {
  const hamFiyat = useDepo(ANAHTARLAR.fiyat);
  const fiyat = paket.fiyatlar.includes(Number(hamFiyat)) ? Number(hamFiyat) : null;
  const [kapali, setKapali] = useState(false);
  const [tiklandi, setTiklandi] = useState(false);
  const kartRef = useRef<HTMLDivElement>(null);
  const goruldu = useRef(false);

  useEffect(() => {
    if (hamFiyat !== undefined && fiyat === null) {
      yaz(ANAHTARLAR.fiyat, String(paket.fiyatlar[Math.floor(Math.random() * paket.fiyatlar.length)]));
    }
  }, [hamFiyat, fiyat, paket.fiyatlar]);

  useEffect(() => {
    const el = kartRef.current;
    if (!el || fiyat === null) return;
    const gozlemci = new IntersectionObserver(([g]) => {
      if (g.isIntersecting && !goruldu.current) {
        goruldu.current = true;
        olay("paket_karti_goruldu", { fiyat, tetikleyici: tetikleyici.id });
      }
    });
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [fiyat, tetikleyici.id]);

  if (kapali || fiyat === null) return null;

  return (
    <div ref={kartRef} className="rounded-lg border border-cizgi bg-yuzey p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">{paket.ad}</h2>
          <p className="mt-1 text-base text-metin-ikincil">{paket.aciklama}</p>
        </div>
        <button
          type="button"
          onClick={() => setKapali(true)}
          aria-label="Paket kartını kapat"
          className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xl text-metin-ikincil hover:bg-bilgi-acik"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {tetikleyici.metin && <p className="mt-4 rounded-md bg-vurgu-acik px-3 py-2 text-base">{tetikleyici.metin}</p>}

      <ul className="mt-4 list-disc space-y-1 pl-5 text-base">
        {paket.icerik.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>

      <p className="mt-4 text-lg">
        Tek seferlik: <strong>{fiyat.toLocaleString("tr-TR")} TL</strong>
      </p>

      {!tiklandi ? (
        <button
          type="button"
          onClick={() => {
            setTiklandi(true);
            olay("paket_tiklandi", { fiyat, tetikleyici: tetikleyici.id });
          }}
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-lg border border-vurgu bg-yuzey px-6 py-3 text-base font-semibold text-vurgu-koyu hover:bg-vurgu-acik"
        >
          Paketi al
        </button>
      ) : (
        <div role="status" className="mt-4 space-y-2 rounded-md bg-bilgi-acik px-4 py-3 text-base">
          <p>{paket.yakinda_metni}</p>
          <p className="text-metin-ikincil">{paket.eposta_yakinda_metni}</p>
        </div>
      )}
    </div>
  );
}
