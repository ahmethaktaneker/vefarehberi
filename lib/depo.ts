"use client";

import { useSyncExternalStore } from "react";

/**
 * Tarayıcıda saklama (Brief 4.4, 12). Sunucuya hiçbir şey gönderilmez.
 * localStorage erişilemezse (gizli pencere, engellenmiş site verisi) bellek içinde devam eder;
 * sayfa yenilenince kaybolur ama akış çalışmaya devam eder.
 */

export const ANAHTARLAR = {
  cevaplar: "vefa:cevaplar:v1",
  soruSirasi: "vefa:soru:v1",
  yapilanlar: "vefa:yapilanlar:v1",
  belgeler: "vefa:belgeler:v1",
  /** Paket fiyat testi varyantı; "baştan başla" ile silinmez (aynı ziyaretçiye hep aynı fiyat). */
  fiyat: "vefa:fiyat:v1",
} as const;

const bellek = new Map<string, string | null>();
const dinleyiciler = new Set<() => void>();

function oku(anahtar: string): string | null {
  try {
    return window.localStorage.getItem(anahtar);
  } catch {
    return bellek.get(anahtar) ?? null;
  }
}

export function yaz(anahtar: string, deger: string | null) {
  bellek.set(anahtar, deger);
  try {
    if (deger === null) window.localStorage.removeItem(anahtar);
    else window.localStorage.setItem(anahtar, deger);
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
