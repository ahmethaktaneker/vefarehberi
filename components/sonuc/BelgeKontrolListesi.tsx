"use client";

import { useEffect, useMemo } from "react";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import type { Belge } from "@/lib/icerik/sema";
import { kartaGit } from "@/components/sonuc/AdimKarti";

type Satir = { belge: Belge; adimlar: { id: string; baslik: string }[] };

/**
 * Birleşik belge listesi, kontrol listesi olarak. "Hazır" işaretleri yalnızca bu cihazda saklanır.
 * Yazdırıldığında yalnızca bu liste çıkar.
 */
export function BelgeKontrolListesi({ liste }: { liste: Satir[] }) {
  const ham = useDepo(ANAHTARLAR.belgeler);
  const hazir = useMemo(() => new Set(jsonCoz<string[]>(ham, [])), [ham]);

  useEffect(() => {
    const temizle = () => document.body.classList.remove("yazdir-belgeler");
    window.addEventListener("afterprint", temizle);
    return () => window.removeEventListener("afterprint", temizle);
  }, []);

  if (liste.length === 0) return <p>Cevaplarınıza göre listelenecek bir belge yok.</p>;

  function degistir(id: string, v: boolean) {
    const yeni = new Set(hazir);
    if (v) yeni.add(id);
    else yeni.delete(id);
    yaz(ANAHTARLAR.belgeler, JSON.stringify([...yeni]));
  }

  const hazirSayisi = liste.filter((s) => hazir.has(s.belge.id)).length;

  return (
    <div className="belge-yazdir">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-metin-ikincil" aria-live="polite">
          {liste.length} belgeden {hazirSayisi} tanesi hazır.
        </p>
        <button
          type="button"
          onClick={() => {
            document.body.classList.add("yazdir-belgeler");
            window.print();
          }}
          className="yazdirma-gizle inline-flex min-h-11 items-center rounded-lg border border-cizgi bg-yuzey px-4 py-2 text-base font-semibold text-vurgu-koyu hover:border-vurgu"
        >
          Listeyi yazdır
        </button>
      </div>
      <h3 className="hidden print:block print:mb-4 print:text-xl print:font-semibold">Vefa Rehberi: belge listesi</h3>
      <ul className="space-y-3">
        {liste.map(({ belge, adimlar }) => {
          const secili = hazir.has(belge.id);
          return (
            <li key={belge.id} className="rounded-lg border border-cizgi bg-yuzey p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={secili}
                  onChange={(e) => degistir(belge.id, e.target.checked)}
                  className="mt-1 size-6 shrink-0 accent-vurgu"
                />
                <span>
                  <span className={`block text-lg font-semibold ${secili ? "text-metin-ikincil" : ""}`}>{belge.ad}</span>
                  {secili && <span className="text-base text-vurgu-koyu">Hazır</span>}
                </span>
              </label>
              {belge.not && <p className="mt-2 ml-9 text-base">{belge.not}</p>}
              <p className="mt-2 ml-9 text-base text-metin-ikincil">
                {adimlar.length === 1 ? "Gerektiği adım: " : `${adimlar.length} adımda gerekiyor: `}
                {adimlar.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && " · "}
                    <a href={`#adim-${a.id}`} onClick={() => kartaGit(a.id)} className="inline-block py-2.5 underline underline-offset-2">
                      {a.baslik}
                    </a>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
