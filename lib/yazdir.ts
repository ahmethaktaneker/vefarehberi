"use client";

/**
 * Liste sayfasını yazdırır: ekrandaki etkileşimli görünüm yerine yazdırma için hazırlanmış tam liste
 * (tüm adımlar ayrıntılarıyla ve belge listesi) çıkar. Bkz. globals.css "yazdir-liste".
 */
export function listeyiYazdir() {
  const acikPanel = document.querySelector<HTMLDialogElement>("dialog.panel[open]");
  acikPanel?.close();
  document.body.classList.add("yazdir-liste");
  const temizle = () => {
    document.body.classList.remove("yazdir-liste");
    window.removeEventListener("afterprint", temizle);
  };
  window.addEventListener("afterprint", temizle);
  window.print();
}
