import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { sayfaYukle } from "@/lib/icerik/metinler";

const sayfa = () => sayfaYukle("yurtdisi");

export function generateMetadata(): Metadata {
  const s = sayfa();
  return { title: s.baslik, description: s.aciklama, alternates: { canonical: "/yurtdisi" } };
}

export default function Page() {
  return <RehberSayfasi sayfa={sayfa()} />;
}
