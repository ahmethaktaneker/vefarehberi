"use client";

import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";

export default function HataSayfasi({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Sayfa baslik="Bir sorun oluştu">
      <p className="text-lg">
        Sayfa yüklenirken beklenmedik bir sorun oluştu. Listeniz ve işaretleriniz bu cihazda duruyor; tekrar
        denemeniz yeterli olabilir.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-vurgu px-6 py-3 text-lg font-semibold text-white hover:bg-vurgu-koyu"
        >
          Tekrar dene
        </button>
        <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-cizgi bg-yuzey px-6 py-3 text-lg font-semibold text-vurgu-koyu hover:border-vurgu">
          Ana sayfa
        </Link>
      </div>
    </Sayfa>
  );
}
