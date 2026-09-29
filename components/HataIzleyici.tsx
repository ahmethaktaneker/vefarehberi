"use client";

import { useEffect } from "react";
import { hataMetni, olay } from "@/lib/analitik";

/**
 * Tarayıcıda yakalanmayan hataları Umami'ye olay olarak bildirir: yalnızca sayfa yolu ve temizlenmiş,
 * kısaltılmış hata mesajı gider (kişisel veri yok). Bir sayfada en fazla 3 bildirim yapılır.
 */
export function HataIzleyici() {
  useEffect(() => {
    let sayac = 0;
    const bildir = (mesaj: unknown, tur: string) => {
      if (sayac++ >= 3) return;
      olay("hata", { sayfa: window.location.pathname, mesaj: hataMetni(mesaj), tur });
    };
    const hata = (e: ErrorEvent) => bildir(e.message, "hata");
    const reddedildi = (e: PromiseRejectionEvent) => bildir(e.reason instanceof Error ? e.reason.message : e.reason, "vaat");
    window.addEventListener("error", hata);
    window.addEventListener("unhandledrejection", reddedildi);
    return () => {
      window.removeEventListener("error", hata);
      window.removeEventListener("unhandledrejection", reddedildi);
    };
  }, []);
  return null;
}
