import type { Terim } from "@/lib/icerik/sema";

export type Parca = string | { metin: string; terim: Terim };

function kacir(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** İlk harfi büyük/küçük her iki yazımı da yakalar (Türkçe İ/ı dahil). */
function desen(ifade: string): string {
  const ilk = ifade[0];
  const secenekler = new Set([ilk.toLocaleUpperCase("tr"), ilk.toLocaleLowerCase("tr")]);
  return `[${[...secenekler].map(kacir).join("")}]${kacir(ifade.slice(1))}`;
}

/**
 * Metni parçalara ayırır; sözlükteki terimlerin metindeki ilk geçişini işaretler.
 * Uzun ifadeler önce eşleşir ("ilişik kesme belgesi", "ilişik kesme"den önce).
 * Terimin bir kelimenin parçası olarak geçtiği yerler de eşleşir (ör. "mirasçılık belgesindeki").
 */
export function terimleriIsaretle(metin: string, sozluk: Terim[], gorulen = new Set<string>()): Parca[] {
  const ifadeler = sozluk
    .flatMap((t) => [t.terim, ...t.esanlamlilar].map((ifade) => ({ ifade, t })))
    .sort((a, b) => b.ifade.length - a.ifade.length);
  if (ifadeler.length === 0) return [metin];
  const re = new RegExp(`(?<![\\p{L}])(${ifadeler.map((x) => desen(x.ifade)).join("|")})`, "gu");

  const parcalar: Parca[] = [];
  let son = 0;
  for (const m of metin.matchAll(re)) {
    const bulunan = ifadeler.find((x) => x.ifade.toLocaleLowerCase("tr") === m[0].toLocaleLowerCase("tr"))!;
    if (gorulen.has(bulunan.t.terim)) continue;
    gorulen.add(bulunan.t.terim);
    if (m.index > son) parcalar.push(metin.slice(son, m.index));
    parcalar.push({ metin: m[0], terim: bulunan.t });
    son = m.index + m[0].length;
  }
  if (son < metin.length) parcalar.push(metin.slice(son));
  return parcalar;
}
