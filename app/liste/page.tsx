import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { TaslakNotu } from "@/components/TaslakNotu";

export const metadata: Metadata = {
  title: "Listemi oluştur",
  alternates: { canonical: "/liste" },
};

export default function Page() {
  return (
    <Sayfa baslik="Listemi oluştur">
      <TaslakNotu>Soru akışı hazırlanıyor. Kısa süre içinde burada birkaç soruya cevap vererek size özel listenizi görebileceksiniz.</TaslakNotu>
      <p>
        <Link href="/" className="text-vurgu-koyu underline underline-offset-4">
          Ana sayfaya dön
        </Link>
      </p>
    </Sayfa>
  );
}
