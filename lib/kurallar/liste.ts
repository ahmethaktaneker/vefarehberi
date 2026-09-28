import type { Adim, AvukatUyarisi, Icerik, Parametreler } from "@/lib/icerik/sema";
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
};

/**
 * Veraset beyannamesi süresi (Brief 6.3, 7 madde 17).
 * Brief yalnızca iki durumu tanımlar: her şey Türkiye'de → TR süresi,
 * vefat Türkiye'de ve mirasçılar yurtdışında → yurtdışı süresi.
 * Diğer kombinasyonlarda en kısa süre gösterilir ve süre belirsiz işaretlenir.
 */
export function verasetSuresi(c: Cevaplar, p: Parametreler): { ay: number; belirsiz: boolean } {
  const { veraset_beyanname_ay_tr: tr, veraset_beyanname_ay_yurtdisi: yd } = p.sureler;
  if (c.vefat_yeri === "turkiye" && c.mirasci_yeri === "turkiye") return { ay: tr, belirsiz: false };
  if (c.vefat_yeri === "turkiye" && c.mirasci_yeri === "yurtdisi") return { ay: yd, belirsiz: false };
  return { ay: Math.min(tr, yd), belirsiz: true };
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

  return { adimlar, sonTarihliler, avukatUyarilari };
}
