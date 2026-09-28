import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { rehberSluglari } from "@/lib/icerik/metinler";
import { hazirSayfa } from "@/lib/icerik/sayfalar";

export const dynamicParams = false;

export function generateStaticParams() {
  return rehberSluglari().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/rehber/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = hazirSayfa(`rehber/${slug}`);
  return {
    title: s.seo_baslik ?? s.baslik,
    description: s.aciklama,
    alternates: { canonical: `/rehber/${slug}` },
    openGraph: { title: s.seo_baslik ?? s.baslik, description: s.aciklama, type: "article" },
  };
}

export default async function Page({ params }: PageProps<"/rehber/[slug]">) {
  const { slug } = await params;
  return <RehberSayfasi sayfa={hazirSayfa(`rehber/${slug}`)} yol={`/rehber/${slug}`} />;
}
