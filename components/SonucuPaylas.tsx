"use client";

import { useState } from "react";
import { olay } from "@/lib/analitik";
import { SITE_URL } from "@/lib/marka";

/**
 * Hesaplayıcı sonucunu aileyle paylaşma: WhatsApp'ta gönderme ve metni kopyalama. Metin yalnızca ekrandaki
 * sonucu içerir (kullanıcının yazdığı adlar dahil); tarayıcıda üretilir, bize gönderilmez.
 */
export function SonucuPaylas({ baslik, satirlar, yol }: { baslik: string; satirlar: string[]; yol: string }) {
  const [durum, setDurum] = useState("");
  const metin = [baslik, "", ...satirlar, "", "Genel bir hesaptır; kesin sonuç resmi kurumlarca belirlenir.", `${SITE_URL}${yol}`].join("\n");

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(metin);
      setDurum("Sonuç kopyalandı.");
      olay("sonuc_paylasildi", { yontem: "kopyala" });
    } catch {
      setDurum("Kopyalanamadı; metni elle seçip kopyalayabilirsiniz.");
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-cizgi pt-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(metin)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => olay("sonuc_paylasildi", { yontem: "whatsapp" })}
          className="dugme dugme-ikincil"
        >
          WhatsApp&apos;ta paylaş<span className="sr-only"> (yeni sekmede açılır)</span>
        </a>
        <button type="button" onClick={kopyala} className="dugme dugme-ikincil">
          Sonucu kopyala
        </button>
      </div>
      <p role="status" aria-live="polite" className="text-base text-vurgu-koyu">
        {durum}
      </p>
    </div>
  );
}
