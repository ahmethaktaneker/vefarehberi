"use client";

import { useSyncExternalStore } from "react";

/**
 * Tarayıcıda saklama (Brief 4.4, 12). Sunucuya hiçbir şey gönderilmez.
 * localStorage erişilemezse (gizli pencere, engellenmiş site verisi) bellek içinde devam eder;
 * sayfa yenilenince kaybolur ama akış çalışmaya devam eder.
 *
 * Kalıcı depo şifreli değildir. Riski azaltmak için: T.C. kimlik numaraları yalnızca oturum deposunda
 * (sekme kapanınca silinir) tutulur ve siteye HAREKETSIZ_SILME_GUN gün girilmezse bütün veriler silinir.
 */

export const ANAHTARLAR = {
  cevaplar: "vefa:cevaplar:v1",
  soruSirasi: "vefa:soru:v1",
  yapilanlar: "vefa:yapilanlar:v1",
  belgeler: "vefa:belgeler:v1",
  /** Beyanname hazırlık aracının verisi (varlıklar, tutarlar, mirasçılar). */
  beyanname: "vefa:beyanname:v1",
  /** Reddi miras tablosu: varlık ve borç listesi, yapılan kontroller. */
  reddiMiras: "vefa:reddi-miras:v1",
  /** Beyannamedeki T.C. kimlik numaraları; yalnızca oturum deposunda (bkz. lib/beyanname/kimlik.ts). */
  beyannameKimlik: "vefa:beyanname-kimlik:v1",
  /** Paket fiyat testi varyantı; "baştan başla" ile silinmez (aynı ziyaretçiye hep aynı fiyat). */
  fiyat: "vefa:fiyat:v1",
} as const;

/** Sekme kapanınca silinmesi gereken anahtarlar. */
const OTURUM_ANAHTARLARI = new Set<string>([ANAHTARLAR.beyannameKimlik]);

/** Son kullanım zamanı; bu kadar gün hiç girilmezse cihazdaki bütün veriler silinir. */
export const SON_KULLANIM_ANAHTARI = "vefa:son-kullanim:v1";
export const HAREKETSIZ_SILME_GUN = 270; // en uzun beyanname süresi (8 ay) ve bir ay pay

export function suresiDoldu(sonKullanim: string | null, simdi: number, gun = HAREKETSIZ_SILME_GUN): boolean {
  const son = Number(sonKullanim);
  return !!sonKullanim && Number.isFinite(son) && simdi - son > gun * 24 * 60 * 60 * 1000;
}

const depolama = (anahtar: string): Storage =>
  OTURUM_ANAHTARLARI.has(anahtar) ? window.sessionStorage : window.localStorage;

let temizlikYapildi = false;
/** İlk okumada bir kez: uzun süre kullanılmamışsa verileri siler, sonra son kullanım zamanını yeniler. */
function eskiVeriyiTemizle() {
  if (temizlikYapildi) return;
  temizlikYapildi = true;
  try {
    const ls = window.localStorage;
    if (suresiDoldu(ls.getItem(SON_KULLANIM_ANAHTARI), Date.now())) {
      for (const k of Object.values(ANAHTARLAR)) if (k !== ANAHTARLAR.fiyat) depolama(k).removeItem(k);
    }
    ls.setItem(SON_KULLANIM_ANAHTARI, String(Date.now()));
  } catch {
    // Depo erişilemezse bellek içindeki kopya kullanılır.
  }
}

const bellek = new Map<string, string | null>();
const dinleyiciler = new Set<() => void>();

function oku(anahtar: string): string | null {
  eskiVeriyiTemizle();
  try {
    return depolama(anahtar).getItem(anahtar);
  } catch {
    return bellek.get(anahtar) ?? null;
  }
}

export function yaz(anahtar: string, deger: string | null) {
  bellek.set(anahtar, deger);
  try {
    if (deger === null) depolama(anahtar).removeItem(anahtar);
    else depolama(anahtar).setItem(anahtar, deger);
  } catch {
    // Bellek içindeki kopya kullanılır.
  }
  dinleyiciler.forEach((f) => f());
}

function abone(f: () => void) {
  dinleyiciler.add(f);
  const depolama = (e: StorageEvent) => e.key?.startsWith("vefa:") && f();
  window.addEventListener("storage", depolama);
  return () => {
    dinleyiciler.delete(f);
    window.removeEventListener("storage", depolama);
  };
}

/** Ham metin değeri. Sunucuda ve ilk hidrasyonda `undefined` döner (henüz okunmadı). */
export function useDepo(anahtar: string): string | null | undefined {
  return useSyncExternalStore(
    abone,
    () => oku(anahtar),
    () => undefined,
  );
}

export function jsonCoz<T>(ham: string | null | undefined, varsayilan: T): T {
  if (!ham) return varsayilan;
  try {
    return JSON.parse(ham) as T;
  } catch {
    return varsayilan;
  }
}

export function tumunuSil() {
  Object.values(ANAHTARLAR)
    .filter((k) => k !== ANAHTARLAR.fiyat)
    .forEach((k) => yaz(k, null));
}
