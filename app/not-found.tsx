import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";

export default function BulunamadiSayfasi() {
  return (
    <Sayfa baslik="Aradığınız sayfa bulunamadı">
      <p className="text-lg">Bağlantı eski veya hatalı olabilir. Aşağıdan devam edebilirsiniz.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-vurgu px-6 py-3 text-lg font-semibold text-white hover:bg-vurgu-koyu">
          Ana sayfa
        </Link>
        <Link href="/rehber" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-cizgi bg-yuzey px-6 py-3 text-lg font-semibold text-vurgu-koyu hover:border-vurgu">
          Rehberler
        </Link>
      </div>
    </Sayfa>
  );
}
