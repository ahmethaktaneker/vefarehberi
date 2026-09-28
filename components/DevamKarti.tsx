"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ANAHTARLAR, jsonCoz, useDepo } from "@/lib/depo";
import { akisTamam, type Cevaplar } from "@/lib/sorular";

/** Siteye geri dönen kişiye listesini ya da yarım kalan soruları hatırlatır. Yalnızca bu cihazdaki kayda bakar. */
export function DevamKarti() {
  const ham = useDepo(ANAHTARLAR.cevaplar);
  const cevaplar = useMemo(() => jsonCoz<Cevaplar>(ham, {}), [ham]);
  if (!ham || Object.keys(cevaplar).length === 0) return null;
  const tamam = akisTamam(cevaplar);
  return (
    <div className="mb-8 max-w-2xl rounded-2xl border-l-4 border-altin bg-yuzey p-5 shadow-yuksek">
      <p className="text-lg">{tamam ? "Bu cihazda daha önce oluşturduğunuz bir liste var." : "Sorulara daha önce başlamıştınız."}</p>
      <Link
        href={tamam ? "/liste/sonuc" : "/liste"}
        className="mt-3 dugme dugme-birincil"
      >
        {tamam ? "Listenize dönün" : "Kaldığınız yerden devam edin"}
      </Link>
    </div>
  );
}
