import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { TaslakNotu } from "@/components/TaslakNotu";

export const metadata: Metadata = {
  title: "Yurtdışında yaşayanlar için",
  alternates: { canonical: "/yurtdisi" },
};

export default function Page() {
  return (
    <Sayfa baslik="Yurtdışında yaşayanlar için">
      <TaslakNotu>Bu rehber hazırlanıyor.</TaslakNotu>
      <p>
        <Link href="/" className="text-vurgu-koyu underline underline-offset-4">
          Ana sayfaya dön
        </Link>
      </p>
    </Sayfa>
  );
}
