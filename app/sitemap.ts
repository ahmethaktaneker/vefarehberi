import type { MetadataRoute } from "next";
import { rehberSluglari, sablonlariYukle } from "@/lib/icerik/metinler";
import { hazirSayfa } from "@/lib/icerik/sayfalar";
import { SITE_URL, sayfaGizli } from "@/lib/marka";

/** İçerik dosyasından gelen sayfalarda son güncelleme tarihi, dosyadaki son kontrol tarihidir. */
const tarihli = (yol: string, slug: string) => ({ yol, tarih: hazirSayfa(slug).son_kontrol });

export default function sitemap(): MetadataRoute.Sitemap {
  const sayfalar: { yol: string; tarih?: string }[] = [
    { yol: "/" },
    { yol: "/liste" },
    { yol: "/rehber" },
    ...rehberSluglari().map((s) => tarihli(`/rehber/${s}`, `rehber/${s}`)),
    tarihli("/ilk-48-saat", "ilk-48-saat"),
    tarihli("/yurtdisi", "yurtdisi"),
    tarihli("/hesaplayici/veraset-vergisi", "veraset-vergisi-hesaplama"),
    tarihli("/hesaplayici/miras-payi", "miras-payi-hesaplama"),
    tarihli("/hesaplayici/olum-ayligi", "olum-ayligi-hesaplama"),
    { yol: "/beyanname" },
    { yol: "/reddi-miras" },
    { yol: "/sablonlar" },
    ...sablonlariYukle().map((s) => ({ yol: `/sablonlar/${s.id}`, tarih: s.son_kontrol })),
    tarihli("/hakkimizda", "hakkimizda"),
    { yol: "/sozluk" },
    { yol: "/gizlilik" },
    tarihli("/aydinlatma-metni", "aydinlatma-metni"),
  ];
  return sayfalar
    .filter((s) => !sayfaGizli(s.yol))
    .map((s) => ({ url: `${SITE_URL}${s.yol}`, ...(s.tarih ? { lastModified: s.tarih } : {}) }));
}
