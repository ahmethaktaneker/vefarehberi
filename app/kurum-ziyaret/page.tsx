import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Kilit } from "@/components/beyanname/Kilit";
import { KurumZiyaretSayfalari } from "@/components/KurumZiyaretSayfalari";
import { erisimVar } from "@/lib/erisim";
import { icerikYukle } from "@/lib/icerik/yukle";
import { UCRETLI_KILIT_AKTIF, sayfaGizli } from "@/lib/marka";

export const metadata: Metadata = {
  title: "Kurum ziyaret sayfaları",
  description: "Gideceğiniz her kurum için tek sayfa: yanınıza alacağınız belgeler, gişede ne diyeceğiniz ve dilekçe.",
  robots: { index: false, follow: false },
};

const FAYDALAR = [
  "Listenizdeki her banka, operatör ve fatura kurumu için yazdırılabilir tek bir sayfa hazırlar.",
  "Her sayfada o kuruma götürmeniz gereken belgeler ve elinizde olanlar işaretli gelir.",
  "Gişede ne diyeceğinizi hazır bir cümleyle yazar.",
  "Gereken dilekçeleri aynı sayfada gösterir; eksik belge yüzünden geri dönmezsiniz.",
];

export default async function Page() {
  if (sayfaGizli("/kurum-ziyaret")) notFound();
  const acik = !UCRETLI_KILIT_AKTIF || (await erisimVar("aile"));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 print:p-0">
      <div className="ekran-icerik">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">Kurum ziyaret sayfaları</h1>
      </div>
      <div className="mt-6 print:mt-0">
        {acik ? <KurumZiyaretSayfalari icerik={icerikYukle()} /> : <Kilit urun="aile" paket="Aile Paketi" faydalar={FAYDALAR} />}
      </div>
    </div>
  );
}
