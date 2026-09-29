import { tarihGecerli } from "@/lib/kurallar/tarih";
import { SORULAR, type Cevaplar } from "@/lib/sorular";

/**
 * Aileyle paylaşım bağlantısı (Brief 4.4, 12). Cevaplar sıkıştırılmış olarak adresin "#"
 * kısmında taşınır; bu kısım tarayıcıdan sunucuya gönderilmez, sunucu loglarına düşmez.
 *
 * Biçim: "1." + vefat tarihi (YYYYMMDD) + "." + her soru için bir parça, "." ile ayrılmış.
 *   tek seçim:   seçenek sırası (base36), cevapsızsa boş
 *   çoklu seçim: seçili seçeneklerin bit maskesi (base36), cevapsızsa boş
 * Örnek: "2.20260810.0.0.0.0.1.v.2.t.2.1"
 *
 * Seçeneklerin sırası değişirse eski bağlantılar yanlış çözülür; sıralama değişirse sürümü artırın.
 */

const SURUM = "4"; // 2: yakınlık sorusu kaldırıldı; 3: aboneliklere "kira"; 4: hak sahiplerine "diger_cocuk" eklendi
export const PAYLASIM_ANAHTARI = "p";

export function paylasimKodla(c: Cevaplar): string {
  const parcalar = [SURUM, typeof c.vefat_tarihi === "string" ? c.vefat_tarihi.replaceAll("-", "") : ""];
  for (const s of SORULAR) {
    if (s.tip === "tarih") continue;
    const cevap = c[s.id];
    const degerler = s.secenekler.map((o) => o.deger);
    if (s.tip === "tek") {
      const i = typeof cevap === "string" ? degerler.indexOf(cevap) : -1;
      parcalar.push(i >= 0 ? i.toString(36) : "");
    } else {
      const secili = Array.isArray(cevap) ? cevap : [];
      const maske = degerler.reduce((m, d, i) => (secili.includes(d) ? m | (1 << i) : m), 0);
      parcalar.push(maske ? maske.toString(36) : "");
    }
  }
  return parcalar.join(".");
}

/** Geçersiz veya bilinmeyen sürümde null döner. */
export function paylasimCoz(kod: string): Cevaplar | null {
  const parcalar = kod.split(".");
  if (parcalar[0] !== SURUM) return null;
  const secimliSorular = SORULAR.filter((s) => s.tip !== "tarih");
  if (parcalar.length !== secimliSorular.length + 2) return null;

  const c: Cevaplar = {};
  const t = parcalar[1];
  if (t) {
    const tarih = `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
    if (!tarihGecerli(tarih)) return null;
    c.vefat_tarihi = tarih;
  }
  for (const [i, s] of secimliSorular.entries()) {
    const p = parcalar[i + 2];
    if (!p) continue;
    if (!/^[0-9a-z]+$/.test(p)) return null;
    const n = parseInt(p, 36);
    if (s.tip === "tek") {
      const o = s.secenekler[n];
      if (!o) return null;
      c[s.id] = o.deger;
    } else {
      if (n >= 1 << s.secenekler.length) return null;
      c[s.id] = s.secenekler.filter((_, j) => n & (1 << j)).map((o) => o.deger);
    }
  }
  return c;
}
