import type { Adim, AvukatUyarisi, Belge, Icerik, Kurum, Parametreler } from "@/lib/icerik/sema";
import { kosulSaglaniyor } from "@/lib/kurallar/kosul";
import { ayEkle, kalanGun, tarihGecerli } from "@/lib/kurallar/tarih";
import { gecerliCevaplar, type Cevaplar } from "@/lib/sorular";

export type SonTarihBilgisi = {
  tarih: string;
  kalanGun: number;
  gecti: boolean;
  /** Süre kesin belirlenemediyse gösterilecek not. */
  belirsizNot?: string;
};

export type TutarBilgisi =
  | { durum: "gecerli"; tutar: number; donem: string; kaynak: string }
  /** Parametre dosyasındaki tutarın geçerlilik dönemi bitmiş; tutar gösterilmez. */
  | { durum: "guncel_degil" };

export type HesaplanmisAdim = Adim & {
  sonTarihBilgisi?: SonTarihBilgisi;
  tutarBilgisi?: TutarBilgisi;
  /** Adım bir "Bilmiyorum" cevabı nedeniyle gösteriliyor. */
  belirsiz: boolean;
};

export type Liste = {
  adimlar: HesaplanmisAdim[];
  /** Son tarihi olan adımlar, en yakından uzağa. */
  sonTarihliler: HesaplanmisAdim[];
  avukatUyarilari: AvukatUyarisi[];
  /** Cevaplara göre ilgili kurumlar. */
  kurumlar: Kurum[];
  /** Gösterilen adımlarda istenen belgelerin birleşik listesi; hangi adımlarda istendiğiyle. */
  belgeListesi: { belge: Belge; adimlar: { id: string; baslik: string }[] }[];
};

/**
 * Veraset beyannamesi süresi (VİVK m.9/1, Brief 6.3).
 *   Ölüm Türkiye'de:   mirasçı Türkiye'de 4 ay, yabancı ülkede 6 ay.
 *   Ölüm yurtdışında:  mirasçı Türkiye'de 6 ay, ölümün olduğu ülkede 4 ay, başka bir yabancı ülkede 8 ay.
 * Soru akışı "yurtdışı"nın aynı ülke mi başka ülke mi olduğunu, "karışık" da mirasçıların
 * dağılımını ayırt etmez; bu durumlarda olası sürelerin en kısası gösterilir ve süre belirsiz işaretlenir.
 */
export function verasetSuresi(c: Cevaplar, p: Parametreler): { ay: number; belirsiz: boolean } {
  const s = p.sureler;
  const tr = s.veraset_beyanname_ay_tr;
  const yd = s.veraset_beyanname_ay_yurtdisi;
  const baska = s.veraset_beyanname_ay_yurtdisi_baska_ulke;

  const olasi: Record<string, number[]> =
    c.vefat_yeri === "turkiye"
      ? { turkiye: [tr], yurtdisi: [yd], karisik: [tr, yd] }
      : { turkiye: [yd], yurtdisi: [tr, baska], karisik: [yd, tr, baska] };
  const sureler = olasi[c.mirasci_yeri as string] ?? [tr, yd, baska];
  return { ay: Math.min(...sureler), belirsiz: new Set(sureler).size > 1 };
}

function sonTarihHesapla(a: Adim, c: Cevaplar, p: Parametreler, bugun: string): SonTarihBilgisi | undefined {
  if (!a.son_tarih || !tarihGecerli(c.vefat_tarihi)) return undefined;
  const { sure } = a.son_tarih;
  let ay: number;
  let belirsiz = false;
  if ("ay" in sure) ay = sure.ay;
  else if ("parametre" in sure) ay = p.sureler[sure.parametre];
  else ({ ay, belirsiz } = verasetSuresi(c, p));

  const tarih = ayEkle(c.vefat_tarihi, ay);
  const kalan = kalanGun(tarih, bugun);
  return {
    tarih,
    kalanGun: kalan,
    gecti: kalan < 0,
    belirsizNot: belirsiz ? a.son_tarih.belirsiz_not : undefined,
  };
}

/** "2026" veya "2026-01-01..2026-06-30" dönemi bugünü kapsıyor mu? */
export function donemGecerli(gecerlilik: string, bugun: string): boolean {
  const [bas, son] = gecerlilik.includes("..")
    ? gecerlilik.split("..")
    : [`${gecerlilik}-01-01`, `${gecerlilik}-12-31`];
  return bas <= bugun && bugun <= son;
}

function tutarHesapla(a: Adim, p: Parametreler, bugun: string): TutarBilgisi | undefined {
  if (!a.tutar) return undefined;
  const t = p.cenaze_odenegi[a.tutar];
  if (!donemGecerli(t.gecerlilik, bugun)) return { durum: "guncel_degil" };
  return { durum: "gecerli", tutar: t.tutar, donem: t.gecerlilik, kaynak: t.kaynak };
}

export function listeOlustur(hamCevaplar: Cevaplar, icerik: Icerik, bugun: string): Liste {
  const c = gecerliCevaplar(hamCevaplar);

  const adimlar: HesaplanmisAdim[] = icerik.adimlar
    .filter((a) => !a.ucretli_icerik && kosulSaglaniyor(a.kosul, c))
    .map((a) => ({
      ...a,
      sonTarihBilgisi: sonTarihHesapla(a, c, icerik.parametreler, bugun),
      tutarBilgisi: tutarHesapla(a, icerik.parametreler, bugun),
      belirsiz: a.belirsizse ? kosulSaglaniyor(a.belirsizse, c) : false,
    }));

  const sonTarihliler = adimlar
    .filter((a) => a.sonTarihBilgisi)
    .sort((x, y) => x.sonTarihBilgisi!.tarih.localeCompare(y.sonTarihBilgisi!.tarih));

  const avukatUyarilari = icerik.avukatUyarilari.filter((u) => kosulSaglaniyor(u.kosul, c));

  const kurumlar = icerik.kurumlar.filter((k) => kosulSaglaniyor(k.kosul, c));

  const belgeHaritasi = new Map<string, { id: string; baslik: string }[]>();
  for (const a of adimlar) {
    for (const b of a.belgeler) {
      belgeHaritasi.set(b, [...(belgeHaritasi.get(b) ?? []), { id: a.id, baslik: a.baslik }]);
    }
  }
  const belgeListesi = [...belgeHaritasi]
    .map(([id, adimlarIcin]) => ({ belge: icerik.belgeler[id], adimlar: adimlarIcin }))
    .sort((x, y) => y.adimlar.length - x.adimlar.length);

  return { adimlar, sonTarihliler, avukatUyarilari, kurumlar, belgeListesi };
}
