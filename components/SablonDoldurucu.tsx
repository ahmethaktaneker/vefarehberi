"use client";

import { useState } from "react";
import { CihazdaKalir } from "@/components/CihazdaKalir";
import { olay } from "@/lib/analitik";
import { sablonDoldur } from "@/lib/sablonlar/doldur";

type Alan = { id: string; etiket: string; ornek?: string; cok_satirli?: boolean };

/** Kişisel bilgi istenen alanlar: altında "bunu biz görmüyoruz" notu çıkar. */
const HASSAS = /adres|iletisim|abone_no|tc|iban/;

const dugme =
  "dugme dugme-ikincil";

/**
 * Şablonu kullanıcının cihazında doldurur. Girilen bilgiler hiçbir yere gönderilmez ve
 * saklanmaz; sayfa kapanınca silinir.
 */
export function SablonDoldurucu({ id, govde, alanlar }: { id: string; govde: string; alanlar: Alan[] }) {
  const [degerler, setDegerler] = useState<Record<string, string>>({});
  const [durum, setDurum] = useState("");
  const metin = sablonDoldur(govde, degerler);

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(metin);
      setDurum("Metin kopyalandı.");
      olay("sablon_indirildi", { sablon_id: id });
    } catch {
      setDurum("Kopyalanamadı; metni elle seçip kopyalayabilirsiniz.");
    }
  }

  function indir() {
    const url = URL.createObjectURL(new Blob([metin.replace(/\n/g, "\r\n")], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDurum("Metin dosyası indirildi.");
    olay("sablon_indirildi", { sablon_id: id });
  }

  return (
    <div className="space-y-8">
      <form className="yazdirma-gizle space-y-5 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <p className="text-base text-metin-ikincil">
          T.C. kimlik numarası ve IBAN gibi bilgileri çıktı üzerine elle yazmanızı öneririz.
        </p>
        {alanlar.map((a) => (
          <div key={a.id}>
            <label htmlFor={`alan-${a.id}`} className="block font-semibold">
              {a.etiket}
            </label>
            {a.cok_satirli ? (
              <textarea
                id={`alan-${a.id}`}
                rows={3}
                value={degerler[a.id] ?? ""}
                placeholder={a.ornek}
                onChange={(e) => setDegerler({ ...degerler, [a.id]: e.target.value })}
                className="mt-2 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 py-3 text-lg"
              />
            ) : (
              <input
                id={`alan-${a.id}`}
                value={degerler[a.id] ?? ""}
                placeholder={a.ornek}
                autoComplete="off"
                onChange={(e) => setDegerler({ ...degerler, [a.id]: e.target.value })}
                className="mt-2 min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg"
              />
            )}
            {HASSAS.test(a.id) && <CihazdaKalir className="mt-1" />}
          </div>
        ))}
      </form>

      <section aria-labelledby="onizleme-baslik">
        <h2 id="onizleme-baslik" className="yazdirma-gizle mb-3 font-serif text-xl font-semibold text-vurgu-koyu">
          Önizleme
        </h2>
        <div className="yazdirilacak whitespace-pre-wrap rounded-2xl border border-cizgi bg-yuzey p-6 font-serif text-base leading-relaxed shadow-yuksek">
          {metin}
        </div>
      </section>

      <div className="yazdirma-gizle flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => {
            olay("sablon_indirildi", { sablon_id: id });
            window.print();
          }} className={dugme}>
          Yazdır veya PDF olarak kaydet
        </button>
        <button type="button" onClick={kopyala} className={dugme}>
          Metni kopyala
        </button>
        <button type="button" onClick={indir} className={dugme}>
          Metin dosyası indir
        </button>
      </div>
      <p role="status" aria-live="polite" className="yazdirma-gizle text-base text-vurgu-koyu">
        {durum}
      </p>
    </div>
  );
}
