import type { Metadata } from "next";
import Link from "next/link";
import { BeyannameAraci } from "@/components/beyanname/BeyannameAraci";
import { Kilit } from "@/components/beyanname/Kilit";
import { Sayfa } from "@/components/Sayfa";
import { beyannameIcerikYukle } from "@/lib/beyanname/yukle";
import { erisimVar } from "@/lib/erisim";
import { icerikYukle } from "@/lib/icerik/yukle";
import { UCRETLI_KILIT_AKTIF } from "@/lib/marka";

export const metadata: Metadata = {
  title: "Veraset beyannamesi hazırlık aracı",
  description:
    "Veraset ve intikal vergisi beyannamesini adım adım hazırlayın: varlıklar, mirasçı payları, eklenecek belgeler ve tahmini vergi tek dosyada.",
  alternates: { canonical: "/beyanname" },
};

const FAYDALAR = [
  "Beyannameyi, vergi dairesinin online ekranıyla aynı sırada adım adım hazırlarsınız.",
  "Her varlığın değerini nereden bulacağınızı ve hangi belgenin ekleneceğini gösterir.",
  "Mirasçı paylarına göre herkesin tahmini vergisini hesaplar.",
  "Vergi dairesine götüreceğiniz, yazdırılabilir tek bir hazırlık dosyası çıkarır.",
  "Bilgileriniz yalnızca kendi cihazınızda kalır; kaldığınız yerden devam edersiniz.",
];

export default async function Page() {
  const acik = !UCRETLI_KILIT_AKTIF || (await erisimVar("beyanname"));
  return (
    <Sayfa baslik="Veraset beyannamesi hazırlık aracı">
      <p className="text-lg print:hidden">
        Beyannameyi kendiniz verirsiniz; bu araç hazırlığı kolaylaştırır. Yalnızca tahmini vergiyi görmek için{" "}
        <Link href="/hesaplayici/veraset-vergisi" className="baglanti">
          ücretsiz hesaplayıcıyı
        </Link>{" "}
        kullanabilirsiniz.
      </p>
      {acik ? (
        <BeyannameAraci icerik={beyannameIcerikYukle()} parametreler={icerikYukle().parametreler} />
      ) : (
        <Kilit urun="beyanname" faydalar={FAYDALAR} />
      )}
    </Sayfa>
  );
}
