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
          className="dugme dugme-birincil"
        >
          Tekrar dene
        </button>
        <Link href="/" className="dugme dugme-ikincil">
          Ana sayfa
        </Link>
      </div>
    </Sayfa>
  );
}
