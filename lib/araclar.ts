import type { Liste } from "@/lib/kurallar/liste";
import { PAKET_TANITIMI_AKTIF, sayfaGizli, UCRETLI_KILIT_AKTIF } from "@/lib/marka";
import { gecerliCevaplar, type Cevaplar } from "@/lib/sorular";

/**
 * Sitedeki araçların tek listesi. Menü, sayfa altı, adım ayrıntıları ve liste sayfasındaki öneriler
 * buradan beslenir. `paket` olan araç ücretlidir (erişim kodu ister).
 */

export type PaketId = "beyanname" | "aile";
export type AracId = "miras_payi" | "olum_ayligi" | "veraset_hesaplayici" | "beyanname_araci" | "reddi_miras_tablosu" | "kurum_ziyaret";

export type Arac = { id: AracId; href: string; ad: string; aciklama: string; paket?: PaketId };

export const ARAC_TANIMLARI: Record<AracId, Arac> = {
  miras_payi: { id: "miras_payi", href: "/hesaplayici/miras-payi", ad: "Miras payı hesaplayıcı", aciklama: "Kime, ne oranda kalır?" },
  olum_ayligi: { id: "olum_ayligi", href: "/hesaplayici/olum-ayligi", ad: "Ölüm aylığı hesaplayıcı", aciklama: "Eşe, çocuklara, anne-babaya ne kadar bağlanır?" },
  veraset_hesaplayici: {
    id: "veraset_hesaplayici",
    href: "/hesaplayici/veraset-vergisi",
    ad: "Veraset vergisi hesaplayıcı",
    aciklama: "Size vergi çıkar mı, ne kadar?",
  },
  beyanname_araci: {
    id: "beyanname_araci",
    href: "/beyanname",
    ad: "Beyanname formu doldurma",
    aciklama: "Resmi veraset beyannamesini doldurup yazdırın",
    paket: "beyanname",
  },
  reddi_miras_tablosu: {
    id: "reddi_miras_tablosu",
    href: "/reddi-miras",
    ad: "Mirası reddetmeli miyim?",
    aciklama: "Varlık ve borçları yan yana koyun, kalan süreyi görün",
    paket: "aile",
  },
  kurum_ziyaret: {
    id: "kurum_ziyaret",
    href: "/kurum-ziyaret",
    ad: "Kurum ziyaret sayfaları",
    aciklama: "Her kurum için ne götürülecek, ne denecek",
    paket: "aile",
  },
};

/** Araç sitede gösterilir mi? Kilitli araçlar, paket tanıtımı kapalıyken gizlenir. */
export function aracGorunur(id: AracId): boolean {
  if (sayfaGizli(ARAC_TANIMLARI[id].href)) return false;
  return !ARAC_TANIMLARI[id].paket || !UCRETLI_KILIT_AKTIF || PAKET_TANITIMI_AKTIF;
}

/** "Pakette" etiketi gösterilsin mi? */
export function pakette(id: AracId): boolean {
  return !!ARAC_TANIMLARI[id].paket && UCRETLI_KILIT_AKTIF && PAKET_TANITIMI_AKTIF;
}

export type AracOnerisi = { arac: Arac; neden: string; kalanGun?: number };

/**
 * Liste sayfasındaki "Size yardımcı olacak araçlar": yalnızca listedeki (ve yapılmamış) adımlarla ilgili
 * araçlar, son tarihi yakın olan önce.
 */
export function aracOnerileri(liste: Liste, yapilanlar: Set<string>): AracOnerisi[] {
  const adim = (id: string) => (yapilanlar.has(id) ? undefined : liste.adimlar.find((a) => a.id === id));
  const kalan = (id: string) => {
    const b = adim(id)?.sonTarihBilgisi;
    return b && !b.gecti ? b.kalanGun : undefined;
  };
  const oneriler: AracOnerisi[] = [];
  const ekle = (id: AracId, neden: string, kalanGun?: number) => aracGorunur(id) && oneriler.push({ arac: ARAC_TANIMLARI[id], neden, kalanGun });

  if (adim("reddi_miras")) {
    const g = kalan("reddi_miras");
    ekle("reddi_miras_tablosu", g !== undefined ? `Mirası reddetmek için ${g} gününüz var.` : "Borçlar mallardan fazla mı, görün.", g);
  }
  if (adim("veraset_beyannamesi")) {
    const g = kalan("veraset_beyannamesi");
    ekle("beyanname_araci", g !== undefined ? `Beyanname için ${g} gününüz var.` : "Beyannameyi resmi formda hazırlayın.", g);
    ekle("veraset_hesaplayici", "Vergi çıkıp çıkmayacağını görün.");
  }
  if (adim("olum_ayligi")) ekle("olum_ayligi", "Kime ne kadar aylık bağlanacağını görün.");
  if (adim("mirascilik_belgesi")) ekle("miras_payi", "Mirasçılık belgesindeki payları önceden görün.");
  if (liste.kurumlar.length > 0) ekle("kurum_ziyaret", `Gideceğiniz ${liste.kurumlar.length} kurum için hazır sayfalar.`);

  return oneriler.sort((a, b) => (a.kalanGun ?? Infinity) - (b.kalanGun ?? Infinity));
}

export type PaketOnerisi = { paket: PaketId; nedenler: string[] };

/**
 * Hangi paket öne çıkarılır? Borç riski, kalabalık ya da yurtdışındaki aile varsa Aile Paketi;
 * yalnızca mal varsa Beyanname Paketi; ikisi de yoksa hiçbiri (boşuna para istenmez).
 */
export function paketOnerisi(cevaplar: Cevaplar, liste: Liste, yapilanlar: Set<string>): PaketOnerisi | null {
  if (!PAKET_TANITIMI_AKTIF) return null;
  const c = gecerliCevaplar(cevaplar);
  const acik = (id: string) => liste.adimlar.some((a) => a.id === id) && !yapilanlar.has(id);
  const oneriler = aracOnerileri(liste, yapilanlar);
  const neden = (id: AracId) => oneriler.find((o) => o.arac.id === id)?.neden;

  const kurumAcik = aracGorunur("kurum_ziyaret");
  const aileNedenleri = [
    acik("reddi_miras") && neden("reddi_miras_tablosu") && `${neden("reddi_miras_tablosu")} Varlık ve borç tablosu hazır.`,
    kurumAcik && c.mirasci_sayisi === "4_arti" && "Kalabalık bir aile için her kuruma ne götürüleceği tek sayfada.",
    kurumAcik && (c.mirasci_yeri === "yurtdisi" || c.mirasci_yeri === "karisik") && "Yurtdışındaki mirasçılarla işleri düzenli tutmanız kolaylaşır.",
  ].filter((x): x is string => !!x);

  const beyannameNedeni = acik("veraset_beyannamesi") && aracGorunur("beyanname_araci") ? neden("beyanname_araci") : undefined;

  if (aileNedenleri.length > 0) {
    const kurum = kurumAcik && liste.kurumlar.length > 0 ? `Gideceğiniz ${liste.kurumlar.length} kurum için hazır sayfalar.` : null;
    return {
      paket: "aile",
      nedenler: [...aileNedenleri, ...(kurum ? [kurum] : []), ...(beyannameNedeni ? [`${beyannameNedeni} Resmi form da dahil.`] : [])],
    };
  }
  if (beyannameNedeni) return { paket: "beyanname", nedenler: [`${beyannameNedeni} Resmi formu doldurup yazdırın.`] };
  return null;
}

/** Menü ve sayfa altı bağlantıları için: adres bir araca aitse o aracın görünürlüğü, değilse her zaman görünür. */
export function hrefGorunur(href: string): boolean {
  if (sayfaGizli(href)) return false;
  const arac = Object.values(ARAC_TANIMLARI).find((a) => a.href === href);
  return !arac || aracGorunur(arac.id);
}

export function hrefPakette(href: string): boolean {
  const arac = Object.values(ARAC_TANIMLARI).find((a) => a.href === href);
  return !!arac && pakette(arac.id);
}
