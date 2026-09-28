import type { Metadata } from "next";
import { Sayfa } from "@/components/Sayfa";
import { VergiHesaplayici } from "@/components/VergiHesaplayici";
import { icerikYukle } from "@/lib/icerik/yukle";

export const metadata: Metadata = {
  title: "Veraset ve İntikal Vergisi Hesaplama 2026",
  description:
    "Vefat sonrası işlemlerde veraset ve intikal vergisi çıkıp çıkmayacağını ve yaklaşık tutarını 2026 tarifesiyle tahmin edin.",
  alternates: { canonical: "/hesaplayici/veraset-vergisi" },
};

export default function Page() {
  const { parametreler } = icerikYukle();
  return (
    <Sayfa baslik="Veraset ve intikal vergisi hesaplayıcı">
      <p className="text-lg text-metin-ikincil">
        Size düşen miras payına veraset ve intikal vergisi çıkıp çıkmayacağını ve yaklaşık tutarını görün.
      </p>
      <VergiHesaplayici parametreler={parametreler} />
    </Sayfa>
  );
}
