/**
 * Rehberler, okuyanın o an sorduğu soruya göre gruplanır. Burada adı geçmeyen yeni bir rehber
 * "Diğer rehberler" altında kendiliğinden görünür.
 */
export const REHBER_GRUPLARI: { baslik: string; aciklama: string; sayfalar: { href: string; slug: string }[] }[] = [
  {
    baslik: "Başlarken",
    aciklama: "Ne yapılacağını genel olarak görmek için.",
    sayfalar: [
      { href: "/rehber/vefat-sonrasi-yapilacak-islemler", slug: "rehber/vefat-sonrasi-yapilacak-islemler" },
      { href: "/ilk-48-saat", slug: "ilk-48-saat" },
      { href: "/yurtdisi", slug: "yurtdisi" },
    ],
  },
  {
    baslik: "Miras, borç ve belgeler",
    aciklama: "Mirasçılık belgesi, borçlar ve bankadaki para.",
    sayfalar: [
      { href: "/rehber/mirascilik-belgesi-nasil-alinir", slug: "rehber/mirascilik-belgesi-nasil-alinir" },
      { href: "/rehber/reddi-miras-suresi", slug: "rehber/reddi-miras-suresi" },
      { href: "/rehber/vefat-edenin-banka-hesaplari", slug: "rehber/vefat-edenin-banka-hesaplari" },
      { href: "/rehber/vefat-edenin-kredi-karti-borcu", slug: "rehber/vefat-edenin-kredi-karti-borcu" },
    ],
  },
  {
    baslik: "Mal varlığı ve vergi",
    aciklama: "Beyanname, vergi, tapu ve araç.",
    sayfalar: [
      { href: "/rehber/veraset-vergisi-nasil-odenir", slug: "rehber/veraset-vergisi-nasil-odenir" },
      { href: "/rehber/tapu-intikali-nasil-yapilir", slug: "rehber/tapu-intikali-nasil-yapilir" },
      { href: "/rehber/vefat-edenin-araci-devri", slug: "rehber/vefat-edenin-araci-devri" },
    ],
  },
  {
    baslik: "Size çıkabilecek ödemeler",
    aciklama: "Başvurmazsanız ödenmeyen haklar.",
    sayfalar: [
      { href: "/rehber/cenaze-odenegi", slug: "rehber/cenaze-odenegi" },
      { href: "/rehber/olum-ayligi-basvurusu", slug: "rehber/olum-ayligi-basvurusu" },
      { href: "/rehber/olum-ayligi-ne-kadar", slug: "rehber/olum-ayligi-ne-kadar" },
      { href: "/rehber/vefat-edenin-hayat-sigortasi-sorgulama", slug: "rehber/vefat-edenin-hayat-sigortasi-sorgulama" },
    ],
  },
  {
    baslik: "Abonelikler ve hatlar",
    aciklama: "Telefon, internet ve faturalar.",
    sayfalar: [{ href: "/rehber/vefat-edenin-telefon-hatti", slug: "rehber/vefat-edenin-telefon-hatti" }],
  },
  {
    baslik: "Kendiniz için",
    aciklama: "Bu süreçte yalnız değilsiniz.",
    sayfalar: [{ href: "/rehber/yas-surecinde-destek", slug: "rehber/yas-surecinde-destek" }],
  },
];

/** Aynı konu grubundaki diğer rehberler; grupta yeterli yoksa sıradaki gruptan tamamlanır. */
export function ilgiliRehberler(yol: string, adet = 3): { href: string; slug: string }[] {
  const i = REHBER_GRUPLARI.findIndex((g) => g.sayfalar.some((s) => s.href === yol));
  if (i < 0) return [];
  const sirali = [...REHBER_GRUPLARI.slice(i), ...REHBER_GRUPLARI.slice(0, i)].flatMap((g) => g.sayfalar);
  return sirali.filter((s) => s.href !== yol && s.href.startsWith("/rehber/")).slice(0, adet);
}
