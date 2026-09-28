import type { Parametreler } from "@/lib/icerik/sema";

/**
 * Veraset ve intikal vergisi tahmini (Brief 7, Faz 2). Yasal miras payı hesaplanmaz;
 * kullanıcı kendi payına düşen tutarı girer ya da eşit pay varsayımı seçer.
 *
 * İstisna (VİVK m.4, 2026 tutarları parametreler.yaml'da):
 *   füruğ (çocuklar) ve eşten her birinin hissesi için bir tutar,
 *   füruğ yoksa eşin hissesi için daha yüksek bir tutar,
 *   diğer mirasçılar (anne-baba, kardeş vb.) için istisna yok.
 */

export type MirasciTuru = "cocuk" | "es_cocuklu" | "es_cocuksuz" | "diger";

export type DilimSonucu = { alt: number; ust: number | null; oran: number; matrah: number; vergi: number };

export type VergiSonucu = {
  pay: number;
  istisna: number;
  matrah: number;
  vergi: number;
  dilimler: DilimSonucu[];
};

const kurus = (n: number) => Math.round(n * 100) / 100;

export function istisnaTutari(tur: MirasciTuru, p: Parametreler): number {
  const { her_cocuk_ve_es, furug_yoksa_es } = p.veraset_vergisi.istisna;
  if (tur === "es_cocuksuz") return furug_yoksa_es;
  if (tur === "cocuk" || tur === "es_cocuklu") return her_cocuk_ve_es;
  return 0;
}

export function verasetVergisiHesapla(pay: number, tur: MirasciTuru, p: Parametreler): VergiSonucu {
  const istisna = istisnaTutari(tur, p);
  const matrah = Math.max(0, pay - istisna);
  const dilimler: DilimSonucu[] = [];
  let alt = 0;
  for (const { dilim, oran } of p.veraset_vergisi.tarife_veraset) {
    const ust = dilim === null ? null : alt + dilim;
    const buDilim = Math.max(0, Math.min(matrah, ust ?? Infinity) - alt);
    dilimler.push({ alt, ust, oran, matrah: buDilim, vergi: kurus(buDilim * oran) });
    if (ust === null) break;
    alt = ust;
  }
  const vergi = kurus(dilimler.reduce((t, d) => t + d.vergi, 0));
  return { pay, istisna, matrah, vergi, dilimler };
}

/** "5.000.000", "5 000 000", "5000000,50" gibi Türkçe yazımları sayıya çevirir. Geçersizse null. */
export function tutarOku(metin: string): number | null {
  const temiz = metin.replace(/\s|TL|₺/gi, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(temiz)) return null;
  return Number(temiz);
}
