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

/**
 * Rehberler, okuyanın o an sorduğu soruya göre gruplanır. Burada adı geçmeyen yeni bir rehber
 * "Diğer rehberler" altında kendiliğinden görünür.
 */
const GRUPLAR: { baslik: string; aciklama: string; sayfalar: { href: string; slug: string }[] }[] = [
  {
    baslik: "Başlarken",
    aciklama: "Ne yapılacağını genel olarak görmek için.",
    sayfalar: [
      { href: "/rehber/vefat-sonrasi-yapilacak-islemler", slug: "rehber/vefat-sonrasi-yapilacak-islemler" },
      { href: "/ilk-48-saat", slug: "ilk-48-saat" },
      { href: "/yurtdisi", slug: "yurtdisi" },
    ],
  },
  {
    baslik: "Miras, borç ve belgeler",
    aciklama: "Mirasçılık belgesi, borçlar ve bankadaki para.",
    sayfalar: [
      { href: "/rehber/mirascilik-belgesi-nasil-alinir", slug: "rehber/mirascilik-belgesi-nasil-alinir" },
      { href: "/rehber/reddi-miras-suresi", slug: "rehber/reddi-miras-suresi" },
      { href: "/rehber/vefat-edenin-banka-hesaplari", slug: "rehber/vefat-edenin-banka-hesaplari" },
      { href: "/rehber/vefat-edenin-kredi-karti-borcu", slug: "rehber/vefat-edenin-kredi-karti-borcu" },
    ],
  },
  {
    baslik: "Mal varlığı ve vergi",
    aciklama: "Beyanname, vergi, tapu ve araç.",
    sayfalar: [
      { href: "/rehber/veraset-vergisi-nasil-odenir", slug: "rehber/veraset-vergisi-nasil-odenir" },
      { href: "/rehber/tapu-intikali-nasil-yapilir", slug: "rehber/tapu-intikali-nasil-yapilir" },
      { href: "/rehber/vefat-edenin-araci-devri", slug: "rehber/vefat-edenin-araci-devri" },
    ],
  },
  {
    baslik: "Size çıkabilecek ödemeler",
    aciklama: "Başvurmazsanız ödenmeyen haklar.",
    sayfalar: [
      { href: "/rehber/cenaze-odenegi", slug: "rehber/cenaze-odenegi" },
      { href: "/rehber/olum-ayligi-basvurusu", slug: "rehber/olum-ayligi-basvurusu" },
      { href: "/rehber/olum-ayligi-ne-kadar", slug: "rehber/olum-ayligi-ne-kadar" },
      { href: "/rehber/vefat-edenin-hayat-sigortasi-sorgulama", slug: "rehber/vefat-edenin-hayat-sigortasi-sorgulama" },
    ],
  },
  {
    baslik: "Abonelikler ve hatlar",
    aciklama: "Telefon, internet ve faturalar.",
    sayfalar: [{ href: "/rehber/vefat-edenin-telefon-hatti", slug: "rehber/vefat-edenin-telefon-hatti" }],
  },
  {
    baslik: "Kendiniz için",
    aciklama: "Bu süreçte yalnız değilsiniz.",
    sayfalar: [{ href: "/rehber/yas-surecinde-destek", slug: "rehber/yas-surecinde-destek" }],
  },
];

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
