import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { VergiHesaplayici } from "@/components/VergiHesaplayici";
import { hazirSayfa } from "@/lib/icerik/sayfalar";
import { icerikYukle } from "@/lib/icerik/yukle";

const SLUG = "veraset-vergisi-hesaplama";

export function generateMetadata(): Metadata {
  const s = hazirSayfa(SLUG);
  return { title: s.seo_baslik ?? s.baslik, description: s.aciklama, alternates: { canonical: "/hesaplayici/veraset-vergisi" } };
}

export default function Page() {
  return (
    <RehberSayfasi sayfa={hazirSayfa(SLUG)} yol="/hesaplayici/veraset-vergisi" eylem={false}>
      <VergiHesaplayici parametreler={icerikYukle().parametreler} />
    </RehberSayfasi>
  );
}
