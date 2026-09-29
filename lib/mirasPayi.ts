/**
 * Yasal miras payları (Türk Medeni Kanunu m.495-500). Vasiyet veya miras sözleşmesi yoksa geçerlidir.
 * Kapsam: sağ kalan eş, altsoy (çocuklar ve önceden ölmüş çocukların çocukları) ve ana-baba zümresi
 * (anne, baba, kardeşler ve önceden ölmüş kardeşlerin çocukları). Büyük ana-baba zümresi hesaplanmaz;
 * o durumda yalnızca eşin payı bildirilir.
 *
 * Kurallar:
 *  - m.495: Altsoy birinci derecedir; çocuklar eşit alır; önceden ölen çocuğun yerini kendi altsoyu alır.
 *  - m.496: Altsoy yoksa ana ve baba eşit alır; önceden ölenin yerini kendi altsoyu alır; bir tarafta
 *    hiç mirasçı yoksa bütün miras diğer tarafa kalır.
 *  - m.499: Eş, altsoyla 1/4, ana-baba zümresiyle 1/2, büyük ana-baba zümresiyle 3/4, hiçbiri yoksa tamamı.
 *  - m.498, m.500: Tanınmış evlilik dışı çocuk ve evlatlık, çocuk gibi mirasçıdır.
 */

export type Kesir = { pay: number; payda: number };

const ebob = (a: number, b: number): number => (b === 0 ? Math.abs(a) : ebob(b, a % b));
const sade = (k: Kesir): Kesir => {
  const g = ebob(k.pay, k.payda) || 1;
  return { pay: k.pay / g, payda: k.payda / g };
};
const carp = (a: Kesir, b: Kesir): Kesir => sade({ pay: a.pay * b.pay, payda: a.payda * b.payda });
const topla = (a: Kesir, b: Kesir): Kesir => sade({ pay: a.pay * b.payda + b.pay * a.payda, payda: a.payda * b.payda });
const bol = (a: Kesir, n: number): Kesir => sade({ pay: a.pay, payda: a.payda * n });
const SIFIR: Kesir = { pay: 0, payda: 1 };
const BIR: Kesir = { pay: 1, payda: 1 };

/** Sağ değilse, yerine geçecek sağ çocuklarının sayısı (bir kuşak). */
export type Kisi = { ad: string; sag: boolean; cocukSayisi: number };
export type KardesTuru = "tam" | "anne_bir" | "baba_bir";
export type Kardes = Kisi & { tur: KardesTuru };

export type MirasGirdisi = {
  esSag: boolean;
  cocuklar: Kisi[];
  anneSag: boolean;
  babaSag: boolean;
  kardesler: Kardes[];
};

export type PaySatiri = { kim: string; yakinlik: string; pay: Kesir };
export type MirasSonucu =
  | { durum: "tamam"; zumre: 1 | 2 | 0; satirlar: PaySatiri[]; ortakPayda: number }
  | { durum: "kapsam_disi"; esPayi: Kesir | null };

/** Bir kolun (kişi ve yerine geçen çocukları) mirasçısı var mı? */
const kolDolu = (k: Kisi) => k.sag || k.cocukSayisi > 0;

/** Payı kola dağıtır: kişi sağsa ona, değilse çocuklarına eşit. */
function kolaDagit(k: Kisi, pay: Kesir, yakinlik: string, torunAdi: string): PaySatiri[] {
  if (k.sag) return [{ kim: k.ad, yakinlik, pay }];
  return Array.from({ length: k.cocukSayisi }, (_, i) => ({
    kim: `${k.ad} adına ${i + 1}. ${torunAdi}`,
    yakinlik: torunAdi === "çocuğu" ? "Torunu" : "Yeğeni",
    pay: bol(pay, k.cocukSayisi),
  }));
}

export function mirasPaylari(g: MirasGirdisi): MirasSonucu {
  const satirlar: PaySatiri[] = [];
  const esEkle = (pay: Kesir) => g.esSag && satirlar.push({ kim: "Eşi", yakinlik: "Eşi", pay });

  // 1. zümre: altsoy
  const cocukKollari = g.cocuklar.filter(kolDolu);
  if (cocukKollari.length > 0) {
    const kalan: Kesir = g.esSag ? { pay: 3, payda: 4 } : BIR;
    esEkle({ pay: 1, payda: 4 });
    const kolPayi = bol(kalan, cocukKollari.length);
    cocukKollari.forEach((c) => satirlar.push(...kolaDagit(c, kolPayi, "Çocuğu", "çocuğu")));
    return sonuc(1, satirlar);
  }

  // 2. zümre: ana-baba ve onların altsoyu (kardeşler, yeğenler)
  const taraf = (sag: boolean, tur: KardesTuru) => ({
    sag,
    kardesler: g.kardesler.filter((k) => (k.tur === "tam" || k.tur === tur) && kolDolu(k)),
  });
  const anne = taraf(g.anneSag, "anne_bir");
  const baba = taraf(g.babaSag, "baba_bir");
  const dolu = (t: typeof anne) => t.sag || t.kardesler.length > 0;
  if (dolu(anne) || dolu(baba)) {
    const kalan: Kesir = g.esSag ? { pay: 1, payda: 2 } : BIR;
    esEkle({ pay: 1, payda: 2 });
    const taraflar = [
      { t: anne, ad: "Annesi" },
      { t: baba, ad: "Babası" },
    ].filter((x) => dolu(x.t));
    const tarafPayi = bol(kalan, taraflar.length);
    const kardesPayi = new Map<Kardes, Kesir>();
    for (const { t, ad } of taraflar) {
      if (t.sag) satirlar.push({ kim: ad, yakinlik: ad, pay: tarafPayi });
      else for (const k of t.kardesler) kardesPayi.set(k, topla(kardesPayi.get(k) ?? SIFIR, bol(tarafPayi, t.kardesler.length)));
    }
    for (const [k, pay] of kardesPayi) {
      const yakinlik = k.tur === "tam" ? "Kardeşi" : k.tur === "anne_bir" ? "Anne bir kardeşi" : "Baba bir kardeşi";
      satirlar.push(...kolaDagit(k, pay, yakinlik, "çocuğu (yeğen)"));
    }
    return sonuc(2, satirlar);
  }

  // Büyük ana-baba zümresi kapsam dışı. Eşin payı en az 3/4; o zümrede kimse yoksa tamamı.
  if (g.esSag) return { durum: "kapsam_disi", esPayi: { pay: 3, payda: 4 } };
  return { durum: "kapsam_disi", esPayi: null };
}

function sonuc(zumre: 1 | 2, satirlar: PaySatiri[]): MirasSonucu {
  const ortakPayda = satirlar.reduce((p, s) => (p * s.pay.payda) / ebob(p, s.pay.payda), 1);
  return { durum: "tamam", zumre, satirlar, ortakPayda };
}

/** Kesri ortak paydaya göre yazar: 1/4 ve payda 8 için "2/8". */
export const ortakPaydayla = (k: Kesir, payda: number) => `${(k.pay * payda) / k.payda}/${payda}`;
export const yuzde = (k: Kesir) => (k.pay / k.payda) * 100;
export const kesirToplami = (satirlar: PaySatiri[]) => satirlar.reduce((t, s) => topla(t, s.pay), SIFIR);
export { carp };
