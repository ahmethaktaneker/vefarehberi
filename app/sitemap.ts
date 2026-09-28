import type { MetadataRoute } from "next";
import { rehberSluglari, sablonlariYukle } from "@/lib/icerik/metinler";
import { SITE_URL } from "@/lib/marka";

export default function sitemap(): MetadataRoute.Sitemap {
  const yollar = [
    "/",
    "/liste",
    "/rehber",
    ...rehberSluglari().map((s) => `/rehber/${s}`),
    "/ilk-48-saat",
    "/yurtdisi",
    "/hesaplayici/veraset-vergisi",
    "/sablonlar",
    ...sablonlariYukle().map((s) => `/sablonlar/${s.id}`),
    "/hakkimizda",
    "/sozluk",
    "/gizlilik",
    "/aydinlatma-metni",
  ];
  return yollar.map((y) => ({ url: `${SITE_URL}${y}` }));
}
