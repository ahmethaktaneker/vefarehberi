import type { Metadata } from "next";
import { Kilit } from "@/components/beyanname/Kilit";
import { ReddiMirasTablosu } from "@/components/ReddiMirasTablosu";
import { erisimVar } from "@/lib/erisim";
import { icerikYukle } from "@/lib/icerik/yukle";
import { UCRETLI_KILIT_AKTIF } from "@/lib/marka";

export const metadata: Metadata = {
  title: "Mirası reddetmeli miyim? Varlık ve borç tablosu",
  description:
    "Vefat edenin bildiğiniz varlık ve borçlarını yan yana koyun, reddi miras için kalan süreyi görün, avukata götürmek için özet yazdırın.",
  alternates: { canonical: "/reddi-miras" },
};

const FAYDALAR = [
  "Vefat edenin varlıklarını ve borçlarını yan yana koyar, hangisinin fazla olduğunu gösterir.",
  "Mirası reddetmek için kaç gününüz kaldığını sayar.",
  "Bilinmeyen borç kalmaması için neleri kontrol etmeniz gerektiğini listeler.",
  "Avukatla görüşürken elinizde olacak bir özet yazdırır.",
];

export default async function Page() {
  const acik = !UCRETLI_KILIT_AKTIF || (await erisimVar("aile"));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 print:p-0">
      <div className="ekran-icerik">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">Mirası reddetmeli miyim?</h1>
        <p className="mt-6 text-lg">Bildiğiniz varlık ve borçları yan yana koyun, kalan süreyi görün, seçenekleri inceleyin.</p>
      </div>
      <div className="mt-6 print:mt-0">
        {acik ? (
          <ReddiMirasTablosu redAy={icerikYukle().parametreler.sureler.reddi_miras_ay} />
        ) : (
          <Kilit urun="aile" paket="Aile Paketi" faydalar={FAYDALAR} />
        )}
      </div>
    </div>
  );
}
