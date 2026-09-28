import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { sablonlariYukle } from "@/lib/icerik/metinler";

export const metadata: Metadata = {
  title: "Dilekçe taslakları",
  description: "Vefat sonrası işlemler için ücretsiz dilekçe taslakları: banka bakiye yazısı, abonelik iptali, otomatik ödeme iptali.",
  alternates: { canonical: "/sablonlar" },
};

export default function Page() {
  const sablonlar = sablonlariYukle().filter((s) => !s.ucretli_icerik);
  return (
    <Sayfa baslik="Dilekçe taslakları">
      <p className="text-lg text-metin-ikincil">
        Taslakları kendi cihazınızda doldurup yazdırabilirsiniz. Girdiğiniz bilgiler hiçbir yere gönderilmez.
      </p>
      <ul className="space-y-3">
        {sablonlar.map((s) => (
          <li key={s.id}>
            <Link href={`/sablonlar/${s.id}`} className="group block rounded-2xl border border-cizgi bg-yuzey px-5 py-4 shadow-kart transition-shadow hover:shadow-yuksek">
              <span className="block text-lg font-bold text-vurgu underline decoration-transparent underline-offset-4 group-hover:decoration-vurgu">{s.baslik}</span>
              <span className="mt-1 block text-base text-metin-ikincil">{s.aciklama}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Sayfa>
  );
}
