import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

export function generateMetadata(): Metadata {
  const s = hazirSayfa("ilk-48-saat");
  return { title: s.seo_baslik ?? s.baslik, description: s.aciklama, alternates: { canonical: "/ilk-48-saat" } };
}

export default function Page() {
  return <RehberSayfasi sayfa={hazirSayfa("ilk-48-saat")} yol="/ilk-48-saat" />;
}
