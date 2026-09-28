import type { Metadata } from "next";
import { RehberSayfasi } from "@/components/RehberSayfasi";
import { sayfaYukle } from "@/lib/icerik/metinler";
import { kvkkDoldur, kvkkYukle } from "@/lib/kvkk";

export const metadata: Metadata = {
  title: "Aydınlatma metni",
  alternates: { canonical: "/aydinlatma-metni" },
};

export default function Page() {
  const sayfa = sayfaYukle("aydinlatma-metni");
  return <RehberSayfasi sayfa={{ ...sayfa, govde: kvkkDoldur(sayfa.govde, kvkkYukle()) }} eylem={false} />;
}
