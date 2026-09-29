"use client";

import type { Belge } from "@/lib/icerik/sema";
import { listeyiYazdir } from "@/lib/yazdir";
import { usePanelAc } from "@/components/sonuc/Panel";

type Satir = { belge: Belge; adimlar: { id: string; baslik: string; neden?: string }[] };

/** Birleşik belge listesi, kontrol listesi olarak. "Hazır" işaretleri yalnızca bu cihazda saklanır. */
export function BelgeKontrolListesi({
  liste,
  hazir,
  turetilmis,
  onBelge,
}: {
  liste: Satir[];
  hazir: Set<string>;
  turetilmis: Map<string, string>;
  onBelge: (id: string, hazir: boolean) => void;
}) {
  const ac = usePanelAc();

  if (liste.length === 0) return <p>Cevaplarınıza göre listelenecek bir belge yok.</p>;

  const hazirSayisi = liste.filter((s) => hazir.has(s.belge.id)).length;

  return (
    <div className="space-y-4">
      <p className="text-base text-metin-ikincil">
        Listenizdeki adımlarda istenen belgeler, en çok gerekenden başlayarak. Hazırladıklarınızı işaretleyin; her kurum farklı belge isteyebilir.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="font-bold">
          {liste.length} belgeden {hazirSayisi} tanesi hazır
        </p>
        <button type="button" onClick={listeyiYazdir} className="dugme dugme-ikincil min-h-11 px-4 py-2 text-base">
          Yazdır
        </button>
      </div>
      <ul className="space-y-3">
        {liste.map(({ belge, adimlar }) => {
          const secili = hazir.has(belge.id);
          const kaynak = turetilmis.get(belge.id);
          return (
            <li key={belge.id} className={`rounded-2xl border bg-yuzey p-4 ${secili ? "border-vurgu/30" : "border-cizgi"}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={secili}
                  disabled={!!kaynak}
                  onChange={(e) => onBelge(belge.id, e.target.checked)}
                  className="mt-0.5 size-6 shrink-0 accent-vurgu"
                />
                <span>
                  {adimlar.every((x) => x.neden) && <span className="block text-sm text-metin-ikincil">İsteğe bağlı</span>}
                  <span className={`block text-lg font-bold leading-snug ${secili ? "text-metin-ikincil line-through" : ""}`}>{belge.ad}</span>
                  {adimlar.every((x) => x.neden) && !secili && <span className="block text-base text-metin-ikincil">{adimlar[0].neden}</span>}
                  {secili && (
                    <span className="block text-base font-bold text-vurgu">{kaynak ? `Hazır: "${kaynak}" adımını yaptınız` : "Hazır"}</span>
                  )}
                </span>
              </label>
              {belge.not && <p className="mt-2 ml-9 text-base">{belge.not}</p>}
              <div className="mt-2 ml-9 text-base text-metin-ikincil">
                {adimlar.length === 1 ? "Gerektiği adım:" : `${adimlar.length} adımda gerekiyor:`}
                <ul className="mt-1 space-y-0.5">
                  {adimlar.map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => ac({ tur: "adim", id: a.id })} className="baglanti py-1.5 text-left">
                        {a.baslik}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
