import type { Metadata } from "next";
import { SoruAkisi } from "@/components/akis/SoruAkisi";

export const metadata: Metadata = {
  title: "Vefat Sonrası Yapılacaklar Listenizi Oluşturun",
  description:
    "Birkaç soruya cevap verin; vefat sonrası yapılacak işlemleri size özel sırayla ve son tarihleriyle görün. Cevaplarınız yalnızca kendi cihazınızda kalır.",
  alternates: { canonical: "/liste" },
};

export default function ListePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SoruAkisi />
    </div>
  );
}
