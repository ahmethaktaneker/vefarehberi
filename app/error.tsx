"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Sayfa } from "@/components/Sayfa";
import { hataMetni, olay } from "@/lib/analitik";

export default function HataSayfasi({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    olay("hata", { sayfa: window.location.pathname, mesaj: hataMetni(error.digest ?? error.message), tur: "sayfa" });
  }, [error]);
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
