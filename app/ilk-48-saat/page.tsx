import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { sayfaYukle } from "@/lib/icerik/metinler";

const sayfa = () => sayfaYukle("ilk-48-saat");

export function generateMetadata(): Metadata {
  const s = sayfa();
  return { title: s.baslik, description: s.aciklama, alternates: { canonical: "/ilk-48-saat" } };
}

export default function Page() {
  return <RehberSayfasi sayfa={sayfa()} />;
}
