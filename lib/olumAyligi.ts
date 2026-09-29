/**
 * Ölüm aylığının hak sahiplerine paylaştırılması (5510 sayılı Kanun m.34).
 *
 *  - Eş: %50. Aylık bağlanan çocuğu yoksa ve çalışmıyor, kendi aylığı da yoksa %75.
 *  - Çocuk (18 yaş altı; lisede 20, yükseköğrenimde 25 yaş altı; %60 ve üzeri malul; ya da yaşı ne olursa
 *    olsun evli olmayan, boşanmış veya dul kız): %25. Anne ve babasız kalan, anne-babası evli olmayan ya da
 *    kendisinden başka aylık alan hak sahibi bulunmayan çocuk: %50.
 *  - Anne ve baba: geliri net asgari ücretten az ve kendi aylığı yoksa, eş ve çocuklardan artan pay
 *    olduğunda toplam %25; 65 yaş üstündeyse artan paya bakılmaksızın toplam %25.
 *  - Toplam, sigortalının aylığını geçemez; geçerse orantılı indirim yapılır.
 */

export type CocukDurumu = "yas" | "malul" | "kiz" | "hicbiri";
export type OlumCocuk = { ad: string; durum: CocukDurumu; calisiyor: boolean; baskaEbeveyn: boolean };
export type OlumEbeveyn = { ad: string; sag: boolean; gelirDusuk: boolean; yas65Ustu: boolean };

export type OlumGirdisi = {
  aylik: number;
  esVar: boolean;
  esCalisiyor: boolean;
  cocuklar: OlumCocuk[];
  anne: OlumEbeveyn;
  baba: OlumEbeveyn;
};

export type HakSahibi = { kim: string; oran: number; tutar: number };
export type OlumSonucu = { satirlar: HakSahibi[]; indirimYapildi: boolean; toplamOran: number; alamayanlar: string[] };

export function olumAyligiPaylari(g: OlumGirdisi): OlumSonucu {
  const alamayanlar: string[] = [];
  const hakliCocuklar = g.cocuklar.filter((c) => {
    // Yaş şartıyla alan çocuğun sigortalı çalışması engel değil (m.34, 7103 s. Kanun ek cümle).
    const uygun = c.durum !== "hicbiri" && (!c.calisiyor || c.durum === "yas");
    if (!uygun) alamayanlar.push(c.ad);
    return uygun;
  });

  const oranlar: { kim: string; oran: number }[] = [];
  if (g.esVar) oranlar.push({ kim: "Eşi", oran: hakliCocuklar.length === 0 && !g.esCalisiyor ? 0.75 : 0.5 });

  const tekHakSahibi = !g.esVar && hakliCocuklar.length === 1;
  for (const c of hakliCocuklar) {
    const yuksek = !g.esVar || c.baskaEbeveyn || tekHakSahibi;
    oranlar.push({ kim: c.ad, oran: yuksek ? 0.5 : 0.25 });
  }

  const hakliEbeveynler = [g.anne, g.baba].filter((e) => e.sag && e.gelirDusuk);
  for (const e of [g.anne, g.baba]) if (e.sag && !e.gelirDusuk) alamayanlar.push(e.ad);
  if (hakliEbeveynler.length > 0) {
    const esVeCocuk = oranlar.reduce((t, x) => t + x.oran, 0);
    const artan = Math.max(0, 1 - esVeCocuk);
    const toplam = hakliEbeveynler.some((e) => e.yas65Ustu) ? 0.25 : Math.min(0.25, artan);
    if (toplam > 0) hakliEbeveynler.forEach((e) => oranlar.push({ kim: e.ad, oran: toplam / hakliEbeveynler.length }));
    else hakliEbeveynler.forEach((e) => alamayanlar.push(e.ad));
  }

  const toplamOran = oranlar.reduce((t, x) => t + x.oran, 0);
  const carpan = toplamOran > 1 ? 1 / toplamOran : 1;
  const satirlar = oranlar.map((x) => {
    const oran = x.oran * carpan;
    return { kim: x.kim, oran, tutar: Math.round(g.aylik * oran * 100) / 100 };
  });
  return { satirlar, indirimYapildi: carpan < 1, toplamOran: Math.min(1, toplamOran), alamayanlar };
}
