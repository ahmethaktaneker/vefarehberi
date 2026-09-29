import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BeyannameAraci } from "@/components/beyanname/BeyannameAraci";
import { Kilit } from "@/components/beyanname/Kilit";
import { beyannameIcerikYukle } from "@/lib/beyanname/yukle";
import { erisimVar } from "@/lib/erisim";
import { icerikYukle } from "@/lib/icerik/yukle";
import { UCRETLI_KILIT_AKTIF, sayfaGizli } from "@/lib/marka";

export const metadata: Metadata = {
  title: "Veraset beyannamesi doldurma aracı",
  description:
    "Veraset ve intikal vergisi beyannamesini adım adım doldurun, resmi form düzeninde yazdırıp vergi dairesine götürün. Eklenecek belgeler ve vergi hesabı dahil.",
  alternates: { canonical: "/beyanname" },
};

const FAYDALAR = [
  "Soruları cevaplarsınız; araç GİB'in resmi Veraset ve İntikal Vergisi Beyannamesi formunu sizin için doldurur.",
  "Her varlığın değerini nereden bulacağınızı ve hangi belgenin ekleneceğini gösterir.",
  "Mirasçı paylarına göre herkesin vergisini hesaplar.",
  "Formu yazdırır, imzalar, vergi dairesine götürürsünüz.",
  "Bilgileriniz yalnızca kendi cihazınızda kalır; kaldığınız yerden devam edersiniz.",
];

export default async function Page() {
  if (sayfaGizli("/beyanname")) notFound();
  const acik = !UCRETLI_KILIT_AKTIF || (await erisimVar("beyanname"));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 print:p-0">
      <div className="ekran-icerik">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">Veraset beyannamesi</h1>
        <p className="mt-6 text-lg">
        Beyannameyi resmi form düzeninde doldurup yazdırın; imzalayıp vergi dairesine götürün. Yalnızca vergiyi görmek için{" "}
        <Link href="/hesaplayici/veraset-vergisi" className="baglanti">
          ücretsiz hesaplayıcıyı
        </Link>{" "}
        kullanabilirsiniz.
        </p>
      </div>
      <div className="mt-6 print:mt-0">
      {acik ? (
        <BeyannameAraci icerik={beyannameIcerikYukle()} parametreler={icerikYukle().parametreler} />
      ) : (
        <Kilit urun="beyanname" faydalar={FAYDALAR} />
      )}
      </div>
    </div>
  );
}
