"use client";

/**
 * Liste sayfasını yazdırır: ekrandaki etkileşimli görünüm yerine yazdırma için hazırlanmış tam liste
 * (tüm adımlar ayrıntılarıyla ve belge listesi) çıkar. Bkz. globals.css "yazdirma-listesi".
 */
export function listeyiYazdir() {
  const acikPanel = document.querySelector<HTMLDialogElement>("dialog.panel[open]");
  acikPanel?.close();
  window.print();
}
