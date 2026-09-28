import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

export function generateMetadata(): Metadata {
  const s = hazirSayfa("yurtdisi");
  return { title: s.seo_baslik ?? s.baslik, description: s.aciklama, alternates: { canonical: "/yurtdisi" } };
}

export default function Page() {
  return <RehberSayfasi sayfa={hazirSayfa("yurtdisi")} yol="/yurtdisi" />;
}
