import type { Metadata } from "next";
import { ReddiMirasTablosu } from "@/components/ReddiMirasTablosu";
import { icerikYukle } from "@/lib/icerik/yukle";

export const metadata: Metadata = {
  title: "Mirası reddetmeli miyim? Varlık ve borç tablosu",
  description:
    "Vefat edenin bildiğiniz varlık ve borçlarını yan yana koyun, reddi miras için kalan süreyi görün, avukata götürmek için özet yazdırın.",
  alternates: { canonical: "/reddi-miras" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 print:p-0">
      <div className="ekran-icerik">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">Mirası reddetmeli miyim?</h1>
        <p className="mt-6 text-lg">Bildiğiniz varlık ve borçları yan yana koyun, kalan süreyi görün, seçenekleri inceleyin.</p>
      </div>
      <div className="mt-6 print:mt-0">
        <ReddiMirasTablosu redAy={icerikYukle().parametreler.sureler.reddi_miras_ay} />
      </div>
    </div>
  );
}
