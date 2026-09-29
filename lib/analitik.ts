/**
 * Çerezsiz, kişisel veri içermeyen olay sayımı (Brief 11). Umami betiği yüklü değilse hiçbir şey yapmaz.
 * Cevapların içeriği asla gönderilmez; yalnızca kategorik ve anonim bilgiler.
 */

export type Olaylar = {
  akis_basladi: { kaynak: string };
  soru_cevaplandi: { soru_no: number };
  akis_tamamlandi: { sure_sn: number };
  bolum_goruntulendi: { bolum: string };
  adim_isaretlendi: { adim_id: string };
  paylasim_linki_kopyalandi: undefined;
  takvime_eklendi: undefined;
  sablon_indirildi: { sablon_id: string };
  hesaplayici_kullanildi: undefined;
  paket_karti_goruldu: { paket: string };
  paket_tiklandi: { paket: string; onerilen: string };
  eposta_birakildi: { paket: string };
  arac_onerisi_tiklandi: { arac: string };
  beyanname_basladi: undefined;
  beyanname_yazdirildi: undefined;
  erisim_kodu_girildi: undefined;
  kilit_goruldu: { urun: string };
};

declare global {
  interface Window {
    umami?: { track: (ad: string, veri?: Record<string, string | number>) => void };
  }
}

export function olay<K extends keyof Olaylar>(ad: K, ...veri: Olaylar[K] extends undefined ? [] : [Olaylar[K]]) {
  try {
    window.umami?.track(ad, veri[0] as Record<string, string | number> | undefined);
  } catch {
    // Ölçüm hiçbir zaman sayfayı bozmamalı.
  }
}

/** Site içinden gelindiyse sayfa yolu; dışarıdan "dis", doğrudan girişte "dogrudan". Dış adresin kendisi gönderilmez. */
export function kaynakSayfa(): string {
  try {
    if (!document.referrer) return "dogrudan";
    const u = new URL(document.referrer);
    return u.origin === window.location.origin ? u.pathname : "dis";
  } catch {
    return "dogrudan";
  }
}
