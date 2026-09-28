import type { BeyannameIcerik } from "@/lib/beyanname/sema";
import { tutarOku, verasetVergisiHesapla, type MirasciTuru, type VergiSonucu } from "@/lib/hesaplayici";
import type { Parametreler } from "@/lib/icerik/sema";

/**
 * Beyanname hazırlık aracının verisi ve hesapları. Veri yalnızca kullanıcının tarayıcısında saklanır.
 * Tutarlar kullanıcının yazdığı metin olarak tutulur (yarım yazılmış "1.250." gibi değerler kaybolmasın).
 */

export type Yakinlik = "cocuk" | "torun" | "es" | "anne_baba" | "kardes" | "diger";

export const YAKINLIK_ETIKETLERI: Record<Yakinlik, string> = {
  cocuk: "Çocuğu",
  torun: "Torunu",
  es: "Eşi",
  anne_baba: "Annesi / babası",
  kardes: "Kardeşi",
  diger: "Diğer",
};

export type Mirasci = { id: string; ad: string; yakinlik: Yakinlik; pay: string };
export type Tasinmaz = { id: string; tur: string; konum: string; hisse: string; deger: string };
export type Hak = { id: string; aciklama: string };
export type Kalem = { id: string; tur: string; aciklama: string; deger: string };
export type Borc = { id: string; tur: string; aciklama: string; tutar: string };

export type BeyannameVerisi = {
  surum: 1;
  muris: { ad: string; vefat_tarihi: string; ikamet: string };
  payda: string;
  mirascilar: Mirasci[];
  tasinmazlar: Tasinmaz[];
  haklar: Hak[];
  digerleri: Kalem[];
  borclar: Borc[];
  /** Hazır işaretlenen eklerin kimlikleri. */
  hazirEkler: string[];
};

export const bosVeri = (): BeyannameVerisi => ({
  surum: 1,
  muris: { ad: "", vefat_tarihi: "", ikamet: "" },
  payda: "",
  mirascilar: [],
  tasinmazlar: [],
  haklar: [],
  digerleri: [],
  borclar: [],
  hazirEkler: [],
});

/** "1/2", "1 / 2", "tam" gibi hisse yazımlarını orana çevirir. Boşsa tam hisse sayılır. */
export function hisseOku(metin: string): number | null {
  const t = metin.trim().toLocaleLowerCase("tr");
  if (t === "" || t === "tam" || t === "tamamı") return 1;
  const m = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const [pay, payda] = [Number(m[1]), Number(m[2])];
  return payda > 0 && pay <= payda && pay > 0 ? pay / payda : null;
}

const tamSayi = (metin: string): number | null => (/^\d+$/.test(metin.trim()) && Number(metin) > 0 ? Number(metin) : null);

export function mirasciTuru(m: Mirasci, tumu: Mirasci[]): MirasciTuru {
  if (m.yakinlik === "cocuk" || m.yakinlik === "torun") return "cocuk";
  if (m.yakinlik === "es") return tumu.some((x) => x.yakinlik === "cocuk" || x.yakinlik === "torun") ? "es_cocuklu" : "es_cocuksuz";
  return "diger";
}

export type MirasciSonucu = { mirasci: Mirasci; oran: number | null; tutar: number | null; vergi: VergiSonucu | null };

export type Ozet = {
  tasinmazToplami: number;
  digerToplami: number;
  brut: number;
  indirim: number;
  net: number;
  /** Değeri okunamayan kalem sayısı (boş ya da hatalı). */
  eksikDeger: number;
  payToplami: number | null;
  payda: number | null;
  mirascilar: MirasciSonucu[];
  toplamVergi: number;
};

export function beyannameOzeti(v: BeyannameVerisi, p: Parametreler): Ozet {
  let eksikDeger = 0;
  const oku = (m: string) => {
    const n = tutarOku(m);
    if (n === null) eksikDeger++;
    return n ?? 0;
  };
  const tasinmazToplami = v.tasinmazlar.reduce((t, x) => t + oku(x.deger) * (hisseOku(x.hisse) ?? 1), 0);
  const digerToplami = v.digerleri.reduce((t, x) => t + oku(x.deger), 0);
  const indirim = v.borclar.reduce((t, x) => t + oku(x.tutar), 0);
  const brut = tasinmazToplami + digerToplami;
  const net = Math.max(0, brut - indirim);

  const payda = tamSayi(v.payda);
  const paylar = v.mirascilar.map((m) => tamSayi(m.pay));
  const payToplami = paylar.every((x) => x !== null) && paylar.length > 0 ? paylar.reduce<number>((t, x) => t + x!, 0) : null;

  const mirascilar = v.mirascilar.map((m, i) => {
    const oran = payda !== null && paylar[i] !== null ? paylar[i]! / payda : null;
    const tutar = oran === null ? null : net * oran;
    const vergi = tutar === null ? null : verasetVergisiHesapla(tutar, mirasciTuru(m, v.mirascilar), p);
    return { mirasci: m, oran, tutar, vergi };
  });

  return {
    tasinmazToplami,
    digerToplami,
    brut,
    indirim,
    net,
    eksikDeger,
    payToplami,
    payda,
    mirascilar,
    toplamVergi: mirascilar.reduce((t, x) => t + (x.vergi?.vergi ?? 0), 0),
  };
}

export type Ek = { id: string; ad: string; neden?: string };

/** Girilen varlıklara göre beyannameye eklenecek belgeler (GİB kılavuzu, 7. adım). */
export function ekListesi(v: BeyannameVerisi, icerik: BeyannameIcerik): Ek[] {
  const ekler: Ek[] = icerik.her_zaman_ekler.map((ad, i) => ({ id: `sabit:${i}`, ad }));
  const tasinmazTurAdi = (id: string) => icerik.tasinmaz.turler.find((t) => t.id === id)?.ad ?? "Taşınmaz";
  for (const t of v.tasinmazlar) {
    const neden = [tasinmazTurAdi(t.tur), t.konum.trim()].filter(Boolean).join(", ");
    icerik.tasinmaz.ekler.forEach((ad, i) => ekler.push({ id: `${t.id}:${i}`, ad, neden }));
  }
  for (const k of v.digerleri) {
    const tur = icerik.digerleri.find((d) => d.id === k.tur);
    const neden = [tur?.ad, k.aciklama.trim()].filter(Boolean).join(", ");
    tur?.ekler.forEach((ad, i) => ekler.push({ id: `${k.id}:${i}`, ad, neden }));
  }
  if (v.borclar.length > 0) icerik.borclar.ekler.forEach((ad, i) => ekler.push({ id: `borc:${i}`, ad }));
  return ekler;
}

let sayac = 0;
export const yeniKimlik = () => `${Date.now().toString(36)}${(sayac++).toString(36)}`;
