import { tasinmazDegeri, type BeyannameVerisi } from "@/lib/beyanname/hesap";
import { tutarOku } from "@/lib/hesaplayici";
import { ayEkle, kalanGun, tarihGecerli } from "@/lib/kurallar/tarih";

/**
 * Reddi miras tablosu: bilinen varlık ve borçları yan yana koyar, 3 aylık süreyi sayar (TMK m.606).
 * Karar vermez; kullanıcının avukata götürebileceği bir özet üretir. Veri yalnızca tarayıcıda kalır.
 */

export type TabloKalemi = { id: string; ad: string; tutar: string };
export type ReddiMirasVerisi = { surum: 1; varliklar: TabloKalemi[]; borclar: TabloKalemi[]; kontroller: string[]; ogrenme?: string };

let sayac = 0;
const kimlik = () => `${Date.now().toString(36)}r${(sayac++).toString(36)}`;
export const yeniKalem = (ad = ""): TabloKalemi => ({ id: kimlik(), ad, tutar: "" });
export const bosTablo = (): ReddiMirasVerisi => ({ surum: 1, varliklar: [], borclar: [], kontroller: [] });

const turAdlari: Record<string, string> = {
  konut: "Daire / ev",
  arsa: "Arsa",
  tarla: "Tarla",
  isyeri: "İşyeri",
  banka: "Banka hesabı",
  arac: "Araç",
  doviz_altin: "Döviz / altın",
  hisse_fon: "Hisse / fon",
  sigorta: "Sigorta",
  ticari: "İşletme payı",
  silah: "Silah",
  hak: "Hak",
  diger: "Diğer varlık",
  belgeli_borc: "Borç",
  vergi_borcu: "Vergi borcu",
};

const bicim = (n: number | null) => (n === null ? "" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n));

/**
 * Başlangıç verisi: beyanname aracında girilenler varsa onlardan, yoksa listedeki cevaplardan boş satırlar.
 * Taşınmazlar için beyannamedeki emlak vergisi değeri gelir; kullanıcı piyasa değeriyle değiştirebilir.
 */
export function tabloBaslat(beyanname: BeyannameVerisi | null, varliklarCevabi: string[]): ReddiMirasVerisi {
  const t = bosTablo();
  if (beyanname && (beyanname.tasinmazlar.length || beyanname.digerleri.length || beyanname.borclar.length)) {
    for (const x of beyanname.tasinmazlar) {
      const yer = [x.mahalle, x.ilce, x.il].filter((s) => s.trim()).join(", ");
      t.varliklar.push({ ...yeniKalem([turAdlari[x.tur] ?? "Taşınmaz", yer].filter(Boolean).join(", ")), tutar: bicim(tasinmazDegeri(x)) });
    }
    for (const x of beyanname.digerleri) {
      t.varliklar.push({ ...yeniKalem([turAdlari[x.tur] ?? "Varlık", x.aciklama.trim()].filter(Boolean).join(", ")), tutar: x.deger });
    }
    for (const x of beyanname.borclar.filter((b) => b.tur !== "cenaze")) {
      t.borclar.push({ ...yeniKalem([turAdlari[x.tur] ?? "Borç", x.aciklama.trim() || x.alacakli.trim()].filter(Boolean).join(", ")), tutar: x.tutar });
    }
    return t;
  }
  const v = new Set(varliklarCevabi);
  if (v.has("ev_arsa") || v.has("baska_sehir_tasinmaz")) t.varliklar.push(yeniKalem("Ev / arsa"));
  if (v.has("banka")) t.varliklar.push(yeniKalem("Banka hesabı"));
  if (v.has("arac")) t.varliklar.push(yeniKalem("Araç"));
  if (v.has("sirket")) t.varliklar.push(yeniKalem("Şirket / ortaklık payı"));
  if (v.has("kredi")) t.borclar.push(yeniKalem("Kredi"));
  if (v.has("kredi_karti")) t.borclar.push(yeniKalem("Kredi kartı"));
  return t;
}

export function tabloOzeti(t: ReddiMirasVerisi) {
  const topla = (l: TabloKalemi[]) => l.reduce((s, x) => s + (tutarOku(x.tutar) ?? 0), 0);
  const eksik = [...t.varliklar, ...t.borclar].filter((x) => tutarOku(x.tutar) === null).length;
  const varlik = topla(t.varliklar);
  const borc = topla(t.borclar);
  return { varlik, borc, fark: varlik - borc, eksik };
}

/** Reddin son günü: ölümü öğrenme tarihinden itibaren 3 ay (TMK m.606). Öğrenme tarihi girilmediyse ölüm tarihi esas alınır. */
export function redSuresi(vefatTarihi: string, bugun: string, ay = 3) {
  if (!tarihGecerli(vefatTarihi)) return null;
  const sonGun = ayEkle(vefatTarihi, ay);
  return { sonGun, kalanGun: kalanGun(sonGun, bugun) };
}
