import type { Metadata } from "next";
import { OlumAyligiHesaplayici } from "@/components/OlumAyligiHesaplayici";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

const SLUG = "olum-ayligi-hesaplama";

export function generateMetadata(): Metadata {
  const s = hazirSayfa(SLUG);
  return { title: s.seo_baslik ?? s.baslik, description: s.aciklama, alternates: { canonical: "/hesaplayici/olum-ayligi" } };
}

export default function Page() {
  return (
    <RehberSayfasi sayfa={hazirSayfa(SLUG)} yol="/hesaplayici/olum-ayligi" eylem={false}>
      <OlumAyligiHesaplayici />
    </RehberSayfasi>
  );
}
