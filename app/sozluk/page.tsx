import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, sayfaGizli } from "@/lib/marka";
import { Sayfa } from "@/components/Sayfa";
import { icerikYukle } from "@/lib/icerik/yukle";
import { jsonLdMetni } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Sözlük: Vefat Sonrası İşlemlerde Geçen Terimler",
  description: "Mirasçılık belgesi, muvafakatname, ilişik kesme belgesi, rayiç bedel gibi vefat sonrası işlemlerde geçen terimlerin kısa açıklamaları.",
  alternates: { canonical: "/sozluk" },
};

/** "Veraset ilamı" → "veraset-ilami": terime doğrudan bağlantı için. */
function terimKimligi(terim: string) {
  return terim
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function Page() {
  if (sayfaGizli("/sozluk")) notFound();
  const terimler = [...icerikYukle().sozluk].sort((a, b) => a.terim.localeCompare(b.terim, "tr"));
  const yapilandirilmis = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Vefat sonrası işlemler sözlüğü",
    url: `${SITE_URL}/sozluk`,
    hasDefinedTerm: terimler.map((t) => ({
      "@type": "DefinedTerm",
      name: t.terim,
      description: t.aciklama,
      url: `${SITE_URL}/sozluk#${terimKimligi(t.terim)}`,
    })),
  };
  return (
    <Sayfa baslik="Sözlük" yol={[{ href: "/", ad: "Ana sayfa" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(yapilandirilmis) }} />
      <p className="text-lg text-metin-ikincil">Vefat sonrası işlemlerde sık geçen terimlerin kısa ve genel açıklamaları.</p>
      <dl className="space-y-4">
        {terimler.map((t) => (
          <div key={t.terim} id={terimKimligi(t.terim)} className="scroll-mt-4 rounded-2xl bg-yuzey p-5 shadow-kart">
            <dt className="font-serif text-lg font-semibold text-vurgu-koyu">
              {t.terim}
              {t.esanlamlilar.length > 0 && <span className="font-normal text-metin-ikincil"> ({t.esanlamlilar.join(", ")})</span>}
            </dt>
            <dd className="mt-1">{t.aciklama}</dd>
          </div>
        ))}
      </dl>
    </Sayfa>
  );
}
