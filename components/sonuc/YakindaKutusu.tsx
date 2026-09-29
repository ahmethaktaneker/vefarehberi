"use client";

import { useState } from "react";
import { olay } from "@/lib/analitik";
import { EpostaFormu } from "@/components/sonuc/PaketKarti";

/** Liste sayfasının en altında: yakında gelecek özellikler için e-posta bırakma (ilgi testi). */
export function YakindaKutusu({ riza }: { riza: { surum: string; metin: string } }) {
  const [acik, setAcik] = useState(false);
  return (
    <section aria-labelledby="yakinda-baslik" className="rounded-2xl border border-cizgi bg-yuzey p-5">
      <h2 id="yakinda-baslik" className="font-semibold">
        Yakında: son tarih hatırlatmaları ve uzman kontrolü
      </h2>
      {acik ? (
        <EpostaFormu paket="yenilikler" riza={riza} />
      ) : (
        <>
          <p className="mt-1 text-base text-metin-ikincil">Kullanıma açıldığında haber almak ister misiniz?</p>
          <button
            type="button"
            onClick={() => {
              setAcik(true);
              olay("paket_tiklandi", { paket: "yenilikler", onerilen: "hayir" });
            }}
            className="dugme dugme-ikincil mt-3 min-h-11 px-5 py-2 text-base"
          >
            Haber ver
          </button>
        </>
      )}
    </section>
  );
}
