/**
 * Yasal miras payları (Türk Medeni Kanunu m.495-500). Vasiyet veya miras sözleşmesi yoksa geçerlidir.
 * Kapsam: sağ kalan eş, altsoy (çocuklar ve önceden ölmüş çocukların çocukları), ana-baba zümresi
 * (anne, baba, kardeşler ve önceden ölmüş kardeşlerin çocukları) ve büyük ana-baba zümresi (büyükanne,
 * büyükbaba, amca, hala, dayı, teyze ve eş yoksa onların çocukları). Yalnızca bir büyükten olan (üvey)
 * amca, hala, dayı, teyze varsa hesap yapılmaz.
 *
 * Kurallar:
 *  - m.495: Altsoy birinci derecedir; çocuklar eşit alır; önceden ölen çocuğun yerini kendi altsoyu alır.
 *  - m.496: Altsoy yoksa ana ve baba eşit alır; önceden ölenin yerini kendi altsoyu alır; bir tarafta
 *    hiç mirasçı yoksa bütün miras diğer tarafa kalır.
 *  - m.497: Altsoy ve ana-baba zümresi yoksa büyük ana-babalar, anne ve baba tarafı olarak iki kolda eşit
 *    alır. Önceden ölenin yerini kendi altsoyu alır; altsoyu yoksa payı aynı koldaki diğer büyüğe, o kolda
 *    hiç mirasçı yoksa diğer kola geçer. Eş varsa önceden ölenin payı yalnızca kendi çocuklarına geçer.
 *  - m.501: Hiç mirasçı yoksa miras Devlete kalır.
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

/** Bir taraftaki büyükanne ve büyükbaba; cocuklar ikisinin ortak çocuklarıdır (amca, hala ya da dayı, teyze). */
export type BuyukKol = { buyukanneSag: boolean; buyukbabaSag: boolean; cocuklar: Kisi[] };

export type MirasGirdisi = {
  esSag: boolean;
  cocuklar: Kisi[];
  anneSag: boolean;
  babaSag: boolean;
  kardesler: Kardes[];
  /** Büyük ana-baba zümresi. Verilmezse bu zümre hesaplanmaz. */
  buyukler?: { anne: BuyukKol; baba: BuyukKol };
  /** Yalnızca bir büyükten olan amca, hala, dayı ya da teyze varsa hesap yapılmaz. */
  uveyVar?: boolean;
};

export type PaySatiri = { kim: string; yakinlik: string; pay: Kesir };
export type MirasSonucu =
  | { durum: "tamam"; zumre: 1 | 2 | 3 | 0; satirlar: PaySatiri[]; ortakPayda: number }
  | { durum: "kapsam_disi"; esPayi: Kesir | null };

/** Bir kolun (kişi ve yerine geçen çocukları) mirasçısı var mı? */
const kolDolu = (k: Kisi) => k.sag || k.cocukSayisi > 0;

/** Payı kola dağıtır: kişi sağsa ona, değilse çocuklarına eşit. */
function kolaDagit(k: Kisi, pay: Kesir, yakinlik: string, torunAdi: string, torunYakinligi: string): PaySatiri[] {
  if (k.sag) return [{ kim: k.ad, yakinlik, pay }];
  return Array.from({ length: k.cocukSayisi }, (_, i) => ({
    kim: `${k.ad} adına ${i + 1}. ${torunAdi}`,
    yakinlik: torunYakinligi,
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
    cocukKollari.forEach((c) => satirlar.push(...kolaDagit(c, kolPayi, "Çocuğu", "çocuğu", "Torunu")));
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
      satirlar.push(...kolaDagit(k, pay, yakinlik, "çocuğu (yeğen)", "Yeğeni"));
    }
    return sonuc(2, satirlar);
  }

  // 3. zümre: büyük ana-babalar ve onların altsoyu (m.497)
  if (!g.buyukler || g.uveyVar) return { durum: "kapsam_disi", esPayi: g.esSag ? { pay: 3, payda: 4 } : null };
  // Eş varsa yalnızca büyüklerin kendi çocukları mirasçı olur; kuzenler olmaz.
  const mirasciCocuklar = (k: BuyukKol) => k.cocuklar.filter((c) => (g.esSag ? c.sag : kolDolu(c)));
  const kollar = [
    { k: g.buyukler.anne, buyukanne: "Anneannesi", buyukbaba: "Anne tarafından dedesi", cocuk: "Dayısı / teyzesi" },
    { k: g.buyukler.baba, buyukanne: "Babaannesi", buyukbaba: "Baba tarafından dedesi", cocuk: "Amcası / halası" },
  ].filter((x) => x.k.buyukanneSag || x.k.buyukbabaSag || mirasciCocuklar(x.k).length > 0);

  if (kollar.length === 0) {
    // Hiç kan hısımı yok: eş varsa mirasın tamamı eşe (m.499), yoksa Devlete (m.501).
    if (g.esSag) esEkle(BIR);
    else satirlar.push({ kim: "Devlet (Hazine)", yakinlik: "Devlet", pay: BIR });
    return sonuc(0, satirlar);
  }

  const kalan: Kesir = g.esSag ? { pay: 1, payda: 4 } : BIR;
  esEkle({ pay: 3, payda: 4 });
  const kolPayi = bol(kalan, kollar.length);
  for (const { k, buyukanne, buyukbaba, cocuk } of kollar) {
    const cocuklar = mirasciCocuklar(k);
    const buyukler = [
      { ad: buyukanne, sag: k.buyukanneSag },
      { ad: buyukbaba, sag: k.buyukbabaSag },
    ];
    if (cocuklar.length === 0) {
      // Önceden ölen büyüğün altsoyu yoksa payı aynı koldaki diğer büyüğe kalır.
      const saglar = buyukler.filter((b) => b.sag);
      for (const b of saglar) satirlar.push({ kim: b.ad, yakinlik: b.ad, pay: bol(kolPayi, saglar.length) });
      continue;
    }
    const yarim = bol(kolPayi, 2);
    let cocuklaraKalan = SIFIR;
    for (const b of buyukler) {
      if (b.sag) satirlar.push({ kim: b.ad, yakinlik: b.ad, pay: yarim });
      else cocuklaraKalan = topla(cocuklaraKalan, yarim);
    }
    if (cocuklaraKalan.pay > 0) {
      const kisiPayi = bol(cocuklaraKalan, cocuklar.length);
      for (const c of cocuklar) satirlar.push(...kolaDagit(c, kisiPayi, cocuk, "çocuğu (kuzen)", "Kuzeni"));
    }
  }
  return sonuc(3, satirlar);
}

function sonuc(zumre: 1 | 2 | 3 | 0, satirlar: PaySatiri[]): MirasSonucu {
  const ortakPayda = satirlar.reduce((p, s) => (p * s.pay.payda) / ebob(p, s.pay.payda), 1);
  return { durum: "tamam", zumre, satirlar, ortakPayda };
}

/** Kesri ortak paydaya göre yazar: 1/4 ve payda 8 için "2/8". */
export const ortakPaydayla = (k: Kesir, payda: number) => `${(k.pay * payda) / k.payda}/${payda}`;
export const yuzde = (k: Kesir) => (k.pay / k.payda) * 100;
export const kesirToplami = (satirlar: PaySatiri[]) => satirlar.reduce((t, s) => topla(t, s.pay), SIFIR);
export { carp };
