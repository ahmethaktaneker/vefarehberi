import type { Belge, Yer, ZamanGrubu } from "@/lib/icerik/sema";
import { ZAMAN_GRUPLARI } from "@/lib/icerik/sema";
import type { HesaplanmisAdim, Liste } from "@/lib/kurallar/liste";

/**
 * Kullanıcının işaretlerine göre liste üzerinde hesaplar: sıradaki adım, bekleyen adımlar,
 * şu anki dönem, "nereye gideceğim" grupları. Saf fonksiyonlar; tarayıcıda çalışır.
 */

/** Son tarihi bu kadar gün veya daha az kalan adımlar sıradaki adım önerisinde öne alınır. */
export const ACIL_GUN = 30;

/** Listede olup henüz yapılmamış önceki adımlar. Listede olmayan önceki adım (ör. belge zaten alınmış) beklenmez. */
export function bekledikleri(a: HesaplanmisAdim, liste: Liste, yapilanlar: Set<string>): HesaplanmisAdim[] {
  return a.onceki
    .map((id) => liste.adimlar.find((x) => x.id === id))
    .filter((x): x is HesaplanmisAdim => !!x && !yapilanlar.has(x.id));
}

/**
 * "Şimdi yapılacak" önerisi:
 * 1) Son tarihi ACIL_GUN içinde olan, geçmemiş ve beklemeyen adımlar (en yakın tarih önce),
 * 2) yoksa listedeki ilk beklemeyen adımın döneminde: önce kritik öncelikli olan, yoksa sıradaki.
 * Kritik öncelik dönem atlatmaz: reddi miras gibi bir karar, önce belge ve borç bilgisi gerektirir.
 * Uyarı niteliğindeki adımlar (yer: dikkat) önerilmez.
 */
export function siradakiAdim(liste: Liste, yapilanlar: Set<string>): HesaplanmisAdim | undefined {
  const adaylar = liste.adimlar.filter(
    (a) => !yapilanlar.has(a.id) && a.yer !== "dikkat" && bekledikleri(a, liste, yapilanlar).length === 0,
  );
  const acil = adaylar
    .filter((a) => a.sonTarihBilgisi && !a.sonTarihBilgisi.gecti && a.sonTarihBilgisi.kalanGun <= ACIL_GUN)
    .sort((x, y) => x.sonTarihBilgisi!.kalanGun - y.sonTarihBilgisi!.kalanGun);
  if (acil[0]) return acil[0];
  const donem = adaylar[0]?.zaman_grubu;
  const buDonem = adaylar.filter((a) => a.zaman_grubu === donem);
  return buDonem.find((a) => a.oncelik === "kritik") ?? buDonem[0];
}

/** İlk yapılmamış adımın dönemi; hepsi bittiyse null. */
export function simdikiDonem(liste: Liste, yapilanlar: Set<string>): ZamanGrubu | null {
  const ilk = liste.adimlar.find((a) => !yapilanlar.has(a.id) && a.yer !== "dikkat");
  return ilk?.zaman_grubu ?? null;
}

export type DonemOzeti = { grup: ZamanGrubu; adimlar: HesaplanmisAdim[]; biten: number; sonTarihVar: boolean };

export function donemler(liste: Liste, yapilanlar: Set<string>): DonemOzeti[] {
  return ZAMAN_GRUPLARI.map((grup) => {
    const adimlar = liste.adimlar.filter((a) => a.zaman_grubu === grup);
    return {
      grup,
      adimlar,
      biten: adimlar.filter((a) => yapilanlar.has(a.id)).length,
      sonTarihVar: adimlar.some((a) => a.sonTarihBilgisi && !a.sonTarihBilgisi.gecti && !yapilanlar.has(a.id)),
    };
  }).filter((d) => d.adimlar.length > 0);
}

export type YerOzeti = { yer: Yer; adimlar: HesaplanmisAdim[]; belgeler: Belge[] };

/** Gidilecek yere göre gruplar; her yerde o yerdeki işler için gereken belgelerin birleşimi ("yanınıza alın"). */
export function yereGore(liste: Liste, belgeler: Record<string, Belge>, sira: readonly Yer[]): YerOzeti[] {
  return sira
    .map((yer) => {
      const adimlar = liste.adimlar.filter((a) => a.yer === yer);
      const ids = [...new Set(adimlar.flatMap((a) => a.belgeler))];
      return { yer, adimlar, belgeler: ids.map((id) => belgeler[id]).filter(Boolean) };
    })
    .filter((y) => y.adimlar.length > 0);
}
