import type { Metadata } from "next";
import { Sonuc } from "@/components/sonuc/Sonuc";
import { icerikYukle } from "@/lib/icerik/yukle";
import { paketYukle } from "@/lib/paket";

export const metadata: Metadata = {
  title: "Size özel listeniz",
  // Kişiye özel sayfa; yayına geçildiğinde de dizine eklenmez.
  robots: { index: false, follow: false },
};

export default function SonucPage() {
  // İçerik build sırasında okunur ve doğrulanır; geçersiz içerik build'i kırar.
  const icerik = icerikYukle();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Sonuc icerik={icerik} paket={paketYukle()} />
    </div>
  );
}
