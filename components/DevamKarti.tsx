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
    <div className="mb-8 rounded-lg border border-vurgu bg-vurgu-acik p-5">
      <p className="text-lg">{tamam ? "Bu cihazda daha önce oluşturduğunuz bir liste var." : "Sorulara daha önce başlamıştınız."}</p>
      <Link
        href={tamam ? "/liste/sonuc" : "/liste"}
        className="mt-3 inline-flex min-h-12 items-center justify-center rounded-lg bg-vurgu px-6 py-3 text-lg font-semibold text-white hover:bg-vurgu-koyu"
      >
        {tamam ? "Listenize dönün" : "Kaldığınız yerden devam edin"}
      </Link>
    </div>
  );
}
