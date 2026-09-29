import type { BeyannameIcerik } from "@/lib/beyanname/sema";
import { tutarOku, verasetVergisiHesapla, type MirasciTuru, type VergiSonucu } from "@/lib/hesaplayici";
import type { Parametreler } from "@/lib/icerik/sema";

/**
 * Beyanname aracının verisi ve hesapları. Alanlar GİB'in resmi Veraset ve İntikal Vergisi Beyannamesi
 * formundaki (1031 A) tablolarla aynıdır. Veri yalnızca kullanıcının tarayıcısında saklanır.
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

export type Muris = {
  tc: string;
  soyad: string;
  ad: string;
  baba_adi: string;
  meslek: string;
  olum_yeri: string;
  vefat_tarihi: string;
  mahalle: string;
  cadde_sokak: string;
  kapi_no: string;
  daire_no: string;
  il_ilce: string;
  posta_kodu: string;
};
export type Mirasci = { id: string; tc: string; ad: string; yakinlik: Yakinlik; dogum_tarihi: string; adres_tel: string; pay: string };
export type Tasinmaz = {
  id: string;
  tur: string;
  il: string;
  ilce: string;
  mahalle: string;
  sokak: string;
  kapi_no: string;
  ada: string;
  parsel: string;
  hisse: string;
  deger: string;
};
export type Kalem = { id: string; tur: string; aciklama: string; nerede: string; adet: string; numara: string; deger: string };
export type Borc = {
  id: string;
  tur: string;
  aciklama: string;
  belge_cinsi: string;
  belge_tarihi: string;
  belge_no: string;
  alacakli: string;
  alacakli_adres: string;
  tutar: string;
};

export type BeyannameVerisi = {
  surum: 2;
  vergi_dairesi: string;
  vd_il_ilce: string;
  muris: Muris;
  payda: string;
  mirascilar: Mirasci[];
  tasinmazlar: Tasinmaz[];
  digerleri: Kalem[];
  borclar: Borc[];
  /** Hazır işaretlenen eklerin kimlikleri. */
  hazirEkler: string[];
};

const bosMuris = (): Muris => ({
  tc: "",
  soyad: "",
  ad: "",
  baba_adi: "",
  meslek: "",
  olum_yeri: "",
  vefat_tarihi: "",
  mahalle: "",
  cadde_sokak: "",
  kapi_no: "",
  daire_no: "",
  il_ilce: "",
  posta_kodu: "",
});

export const yeniMirasci = (): Mirasci => ({ id: yeniKimlik(), tc: "", ad: "", yakinlik: "cocuk", dogum_tarihi: "", adres_tel: "", pay: "" });
export const yeniTasinmaz = (): Tasinmaz => ({
  id: yeniKimlik(),
  tur: "konut",
  il: "",
  ilce: "",
  mahalle: "",
  sokak: "",
  kapi_no: "",
  ada: "",
  parsel: "",
  hisse: "",
  deger: "",
});
export const yeniKalem = (tur: string): Kalem => ({ id: yeniKimlik(), tur, aciklama: "", nerede: "", adet: "", numara: "", deger: "" });
export const yeniBorc = (tur: string): Borc => ({
  id: yeniKimlik(),
  tur,
  aciklama: "",
  belge_cinsi: "",
  belge_tarihi: "",
  belge_no: "",
  alacakli: "",
  alacakli_adres: "",
  tutar: "",
});

export const bosVeri = (): BeyannameVerisi => ({
  surum: 2,
  vergi_dairesi: "",
  vd_il_ilce: "",
  muris: bosMuris(),
  payda: "",
  mirascilar: [],
  tasinmazlar: [],
  digerleri: [],
  borclar: [],
  hazirEkler: [],
});

type Kayit = Record<string, unknown>;
const dizi = (x: unknown): Kayit[] => (Array.isArray(x) ? x.filter((o): o is Kayit => !!o && typeof o === "object") : []);
const metin = (x: unknown) => (typeof x === "string" ? x : "");

/** Kayıtlı veriyi (eski sürümler dahil) güncel biçime getirir; eksik alanlar boş gelir. */
export function veriyiTamamla(ham: unknown): BeyannameVerisi {
  const v = (ham && typeof ham === "object" ? ham : {}) as Kayit;
  const m = (v.muris && typeof v.muris === "object" ? v.muris : {}) as Kayit;
  const b = bosVeri();
  const muris = { ...b.muris, ...(Object.fromEntries(Object.entries(m).filter(([, x]) => typeof x === "string")) as Partial<Muris>) };
  // Sürüm 1: "ikamet" tek alandı.
  if (!muris.il_ilce && metin(m.ikamet)) muris.il_ilce = metin(m.ikamet);
  return {
    ...b,
    vergi_dairesi: metin(v.vergi_dairesi),
    vd_il_ilce: metin(v.vd_il_ilce),
    muris,
    payda: metin(v.payda),
    mirascilar: dizi(v.mirascilar).map((x) => ({ ...yeniMirasci(), ...x }) as Mirasci),
    // Sürüm 1: taşınmazın yeri tek "konum" alanıydı.
    tasinmazlar: dizi(v.tasinmazlar).map((x) => ({ ...yeniTasinmaz(), mahalle: metin(x.konum), ...x }) as Tasinmaz),
    digerleri: dizi(v.digerleri).map((x) => ({ ...yeniKalem("diger"), ...x }) as Kalem),
    borclar: dizi(v.borclar).map((x) => ({ ...yeniBorc("belgeli_borc"), ...x }) as Borc),
    hazirEkler: Array.isArray(v.hazirEkler) ? v.hazirEkler.filter((x): x is string => typeof x === "string") : [],
  };
}

/** "1/2", "1 / 2", "tam" gibi hisse yazımlarını orana çevirir. Boşsa tam hisse sayılır. */
export function hisseOku(metin: string): number | null {
  const t = metin.trim().toLocaleLowerCase("tr");
  if (t === "" || t === "tam" || t === "tamamı") return 1;
  const m = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const [pay, payda] = [Number(m[1]), Number(m[2])];
  return payda > 0 && pay <= payda && pay > 0 ? pay / payda : null;
}

/** Taşınmazın beyan edilecek değeri: emlak vergisi değerinin vefat edenin hissesine düşen kısmı. */
export function tasinmazDegeri(t: Tasinmaz): number | null {
  const n = tutarOku(t.deger);
  return n === null ? null : n * (hisseOku(t.hisse) ?? 1);
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
  const say = (n: number | null) => {
    if (n === null) eksikDeger++;
    return n ?? 0;
  };
  const tasinmazToplami = v.tasinmazlar.reduce((t, x) => t + say(tasinmazDegeri(x)), 0);
  // Tapuda değeri olmayan haklar için değer yazılmaz (VİVK m.10/g); eksik sayılmaz.
  const digerToplami = v.digerleri.reduce((t, x) => t + (x.tur === "hak" && !x.deger.trim() ? 0 : say(tutarOku(x.deger))), 0);
  const indirim = v.borclar.reduce((t, x) => t + say(tutarOku(x.tutar)), 0);
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

/** Girilen varlıklara göre beyannameye eklenecek belgeler. */
export function ekListesi(v: BeyannameVerisi, icerik: BeyannameIcerik): Ek[] {
  const ekler: Ek[] = icerik.her_zaman_ekler.map((ad, i) => ({ id: `sabit:${i}`, ad }));
  const tasinmazTurAdi = (id: string) => icerik.tasinmaz.turler.find((t) => t.id === id)?.ad ?? "Taşınmaz";
  for (const t of v.tasinmazlar) {
    const neden = [tasinmazTurAdi(t.tur), t.mahalle.trim(), t.ilce.trim(), t.il.trim()].filter(Boolean).join(", ");
    icerik.tasinmaz.ekler.forEach((ad, i) => ekler.push({ id: `${t.id}:${i}`, ad, neden }));
  }
  for (const k of v.digerleri) {
    const tur = icerik.digerleri.find((d) => d.id === k.tur);
    const neden = [tur?.ad, k.aciklama.trim() || k.nerede.trim()].filter(Boolean).join(", ");
    tur?.ekler.forEach((ad, i) => ekler.push({ id: `${k.id}:${i}`, ad, neden }));
  }
  if (v.borclar.length > 0) icerik.borclar.ekler.forEach((ad, i) => ekler.push({ id: `borc:${i}`, ad }));
  return ekler;
}

let sayac = 0;
export function yeniKimlik() {
  return `${Date.now().toString(36)}${(sayac++).toString(36)}`;
}
