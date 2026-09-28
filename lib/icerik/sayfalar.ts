import { sayfaYukle, type Sayfa } from "@/lib/icerik/metinler";
import { parametreDegerleri, sayfaDoldur } from "@/lib/icerik/parametreMetin";
import { icerikYukle } from "@/lib/icerik/yukle";

/** Sayfayı yükler ve {{...}} parametrelerini doldurur. Doldurulamayan yer tutucu build'i kırar. */
export function hazirSayfa(slug: string): Sayfa {
  const s = sayfaDoldur(sayfaYukle(slug), parametreDegerleri(icerikYukle().parametreler));
  const kalan = JSON.stringify(s).match(/{{[a-z_]+}}/);
  if (kalan && !slug.startsWith("aydinlatma")) throw new Error(`İçerik hatası (${slug}): doldurulamayan yer tutucu ${kalan[0]}`);
  return s;
}
