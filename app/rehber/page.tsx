import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { rehberSluglari } from "@/lib/icerik/metinler";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

export const metadata: Metadata = {
  title: "Rehberler: Vefat Sonrası İşlemler",
  description: "Vefat sonrası işlemler hakkında kısa, kaynaklı rehberler: reddi miras, cenaze ödeneği, ölüm aylığı, mirasçılık belgesi ve daha fazlası.",
  alternates: { canonical: "/rehber" },
};

const EK: { href: string; slug: string }[] = [
  { href: "/ilk-48-saat", slug: "ilk-48-saat" },
  { href: "/yurtdisi", slug: "yurtdisi" },
  { href: "/hesaplayici/veraset-vergisi", slug: "veraset-vergisi-hesaplama" },
];

export default function Page() {
  const sayfalar = [
    ...rehberSluglari().map((slug) => ({ href: `/rehber/${slug}`, s: hazirSayfa(`rehber/${slug}`) })),
    ...EK.map((e) => ({ href: e.href, s: hazirSayfa(e.slug) })),
  ];
  // Ana rehber en üstte
  sayfalar.sort((a, b) => Number(b.href.endsWith("vefat-sonrasi-yapilacak-islemler")) - Number(a.href.endsWith("vefat-sonrasi-yapilacak-islemler")));
  return (
    <Sayfa baslik="Rehberler">
      <p className="text-lg text-metin-ikincil">Vefat sonrası işlemler hakkında kısa ve kaynaklı rehberler.</p>
      <ul className="space-y-3">
        {sayfalar.map(({ href, s }) => (
          <li key={href}>
            <Link href={href} className="group block rounded-2xl border border-cizgi bg-yuzey px-5 py-4 shadow-kart transition-shadow hover:shadow-yuksek">
              <span className="block text-lg font-bold text-vurgu underline decoration-transparent underline-offset-4 group-hover:decoration-vurgu">{s.baslik}</span>
              <span className="mt-1 block text-base text-metin-ikincil">{s.aciklama}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Sayfa>
  );
}
