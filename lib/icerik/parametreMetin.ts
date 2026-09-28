import type { Parametreler } from "@/lib/icerik/sema";
import type { Sayfa } from "@/lib/icerik/metinler";

const tl = (n: number) =>
  `${n.toLocaleString("tr-TR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} TL`;

/**
 * İçerik metinlerindeki {{...}} yer tutucularını parametreler.yaml'dan doldurur.
 * Böylece yıllık tutarlar tek yerde güncellenir.
 */
export function parametreDegerleri(p: Parametreler): Record<string, string> {
  return {
    yil: String(p.yil),
    cenaze_odenegi_genel: tl(p.cenaze_odenegi.genel_sgk.tutar),
    zamanasimi_yil: String(p.cenaze_odenegi.zamanasimi_yil),
    istisna_cocuk_es: tl(p.veraset_vergisi.istisna.her_cocuk_ve_es),
    istisna_es_furugsuz: tl(p.veraset_vergisi.istisna.furug_yoksa_es),
    tarife_metni: tarifeMetni(p),
  };
}

/** "ilk 3.000.000 TL için %1, sonraki 7.000.000 TL için %3, …, 55.000.000 TL'yi aşan kısım için %10" */
function tarifeMetni(p: Parametreler): string {
  let alt = 0;
  return p.veraset_vergisi.tarife_veraset
    .map(({ dilim, oran }, i) => {
      const yuzde = `%${(oran * 100).toLocaleString("tr-TR")}`;
      if (dilim === null) return `${tl(alt)}'yi aşan kısım için ${yuzde}`;
      alt += dilim;
      return `${i === 0 ? "ilk" : "sonraki"} ${tl(dilim)} için ${yuzde}`;
    })
    .join(", ");
}

export function metinDoldur(metin: string, degerler: Record<string, string>): string {
  return metin.replace(/{{([a-z_]+)}}/g, (tam, ad: string) => degerler[ad] ?? tam);
}

export function sayfaDoldur(s: Sayfa, degerler: Record<string, string>): Sayfa {
  const d = (m: string) => metinDoldur(m, degerler);
  return {
    ...s,
    baslik: d(s.baslik),
    seo_baslik: s.seo_baslik && d(s.seo_baslik),
    aciklama: d(s.aciklama),
    govde: d(s.govde),
    sss: s.sss.map((x) => ({ soru: d(x.soru), cevap: d(x.cevap) })),
  };
}
