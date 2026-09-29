import type { Metadata } from "next";
import { MirasPayiHesaplayici } from "@/components/MirasPayiHesaplayici";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

const SLUG = "miras-payi-hesaplama";

export function generateMetadata(): Metadata {
  const s = hazirSayfa(SLUG);
  return { title: s.seo_baslik ?? s.baslik, description: s.aciklama, alternates: { canonical: "/hesaplayici/miras-payi" } };
}

export default function Page() {
  return (
    <RehberSayfasi sayfa={hazirSayfa(SLUG)} yol="/hesaplayici/miras-payi" eylem={false}>
      <MirasPayiHesaplayici />
    </RehberSayfasi>
  );
}
