import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { TaslakNotu } from "@/components/TaslakNotu";

export const metadata: Metadata = {
  title: "İlk 48 saat için rehber",
  alternates: { canonical: "/ilk-48-saat" },
};

export default function Page() {
  return (
    <Sayfa baslik="İlk 48 saat için rehber">
      <TaslakNotu>Bu rehber hazırlanıyor.</TaslakNotu>
      <p>
        <Link href="/" className="text-vurgu-koyu underline underline-offset-4">
          Ana sayfaya dön
        </Link>
      </p>
    </Sayfa>
  );
}
