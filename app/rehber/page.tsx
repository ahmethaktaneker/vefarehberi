import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { rehberSluglari } from "@/lib/icerik/metinler";
import { hazirSayfa } from "@/lib/icerik/sayfalar";
import { REHBER_GRUPLARI as GRUPLAR } from "@/lib/rehberGruplari";

export const metadata: Metadata = {
  title: "Rehberler: Vefat Sonrası İşlemler",
  description: "Vefat sonrası işlemler hakkında kısa, kaynaklı rehberler: reddi miras, cenaze ödeneği, ölüm aylığı, mirasçılık belgesi ve daha fazlası.",
  alternates: { canonical: "/rehber" },
};

export default function Page() {
  const gruplanan = new Set(GRUPLAR.flatMap((g) => g.sayfalar.map((s) => s.slug)));
  const digerleri = rehberSluglari()
    .map((slug) => `rehber/${slug}`)
    .filter((slug) => !gruplanan.has(slug))
    .map((slug) => ({ href: `/${slug}`, slug }));
  const gruplar = digerleri.length
    ? [...GRUPLAR, { baslik: "Diğer rehberler", aciklama: "", sayfalar: digerleri }]
    : GRUPLAR;

  return (
    <Sayfa baslik="Rehberler">
      <p className="text-lg text-metin-ikincil">
        Vefat sonrası işlemler hakkında kısa ve kaynaklı rehberler. Size özel sırayı ve son tarihleri görmek için{" "}
        <Link href="/liste" className="baglanti">
          listenizi oluşturun
        </Link>
        .
      </p>
      {gruplar.map((g, i) => (
        <section key={g.baslik} aria-labelledby={`grup-${i}`} className="space-y-3">
          <div>
            <h2 id={`grup-${i}`} className="font-serif text-2xl font-semibold text-vurgu-koyu">
              {g.baslik}
            </h2>
            {g.aciklama && <p className="text-base text-metin-ikincil">{g.aciklama}</p>}
          </div>
          <ul className="space-y-3">
            {g.sayfalar.map(({ href, slug }) => {
              const s = hazirSayfa(slug);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="group block rounded-2xl border border-cizgi bg-yuzey px-5 py-4 shadow-kart transition-shadow hover:shadow-yuksek"
                  >
                    <span className="block text-lg font-bold text-vurgu underline decoration-transparent underline-offset-4 group-hover:decoration-vurgu">
                      {s.baslik}
                    </span>
                    <span className="mt-1 block text-base text-metin-ikincil">{s.aciklama}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Sayfa>
  );
}
