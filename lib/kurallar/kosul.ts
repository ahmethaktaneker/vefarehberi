import type { Cevaplar } from "@/lib/sorular";

/**
 * Basit ve güvenli koşul dili (eval yok).
 *
 *   { borc: "evet" }                        cevap "evet" ise
 *   { varliklar: ["kredi", "kredi_karti"] }  cevaplardan biri listedeyse (çoklu seçimde kesişim)
 *   { all: [...] } / { any: [...] } / { not: ... }
 *
 * Bir alanda birden fazla anahtar varsa hepsi sağlanmalıdır. Cevaplanmamış soru koşulu sağlamaz.
 */
export type Kosul =
  | { all: Kosul[] }
  | { any: Kosul[] }
  | { not: Kosul }
  | { [soruId: string]: string | string[] };

export function kosulSaglaniyor(k: Kosul | undefined, c: Cevaplar): boolean {
  if (!k) return true;
  // "all", "any", "not" soru id'si olarak kullanılamaz (şema doğrulaması bunu garanti eder).
  if ("all" in k) return (k.all as Kosul[]).every((alt) => kosulSaglaniyor(alt, c));
  if ("any" in k) return (k.any as Kosul[]).some((alt) => kosulSaglaniyor(alt, c));
  if ("not" in k) return !kosulSaglaniyor(k.not as Kosul, c);
  return Object.entries(k as Record<string, string | string[]>).every(([soruId, beklenen]) => {
    const cevap = c[soruId];
    if (cevap === undefined) return false;
    const beklenenler = Array.isArray(beklenen) ? beklenen : [beklenen];
    const verilenler = Array.isArray(cevap) ? cevap : [cevap];
    return verilenler.some((v) => beklenenler.includes(v));
  });
}
