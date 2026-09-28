"use client";

import { useState } from "react";
import { olay } from "@/lib/analitik";
import type { HesaplanmisAdim } from "@/lib/kurallar/liste";
import { SITE_URL } from "@/lib/marka";
import { PAYLASIM_ANAHTARI, paylasimKodla } from "@/lib/paylasim";
import type { Cevaplar } from "@/lib/sorular";
import { icsOlustur } from "@/lib/takvim";
import { listeyiYazdir } from "@/lib/yazdir";

const dugme = "dugme dugme-ikincil";

export function PaylasHatirla({ cevaplar, sonTarihliler }: { cevaplar: Cevaplar; sonTarihliler: HesaplanmisAdim[] }) {
  const [durum, setDurum] = useState<string>("");
  const baglanti = `${window.location.origin}/liste/sonuc#${PAYLASIM_ANAHTARI}=${paylasimKodla(cevaplar)}`;
  const yaklasanlar = sonTarihliler.filter((a) => !a.sonTarihBilgisi!.gecti);
  const paylasilabilir = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(baglanti);
      setDurum("Bağlantı kopyalandı.");
      olay("paylasim_linki_kopyalandi");
    } catch {
      setDurum("Kopyalanamadı. Aşağıdaki bağlantıyı elle seçip kopyalayabilirsiniz.");
    }
  }

  async function paylas() {
    try {
      await navigator.share({ title: "Vefat Rehberi: yapılacaklar listesi", url: baglanti });
      olay("paylasim_linki_kopyalandi");
    } catch {
      // Kullanıcı paylaşımı iptal etti.
    }
  }

  function takvimIndir() {
    const ics = icsOlustur(
      yaklasanlar.map((a) => ({
        id: a.id,
        baslik: a.baslik,
        tarih: a.sonTarihBilgisi!.tarih,
        aciklama: [a.ne.trim(), a.son_tarih?.not?.trim(), "Genel bilgilendirme amaçlıdır; son tarihi resmi kaynaktan teyit edin.", `${SITE_URL}/liste/sonuc`]
          .filter(Boolean)
          .join("\n\n"),
      })),
    );
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "vefa-rehberi-son-tarihler.ics";
    a.click();
    URL.revokeObjectURL(url);
    setDurum("Takvim dosyası indirildi. Açtığınızda takviminize eklenir.");
    olay("takvime_eklendi");
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-lg font-semibold text-vurgu-koyu">Aileyle paylaşın</h3>
        <p className="mt-2 text-base text-metin-ikincil">
          Bağlantıyı açan kişi aynı listeyi görür. Bağlantı yalnızca verdiğiniz cevapları içerir; isim veya kimlik
          bilgisi içermez ve sunucumuza gönderilmez. &ldquo;Yaptım&rdquo; işaretleri herkesin kendi cihazında kalır.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={kopyala} className={dugme}>
            Bağlantıyı kopyala
          </button>
          {paylasilabilir && (
            <button type="button" onClick={paylas} className={dugme}>
              Paylaş
            </button>
          )}
        </div>
        <label className="mt-3 block text-base text-metin-ikincil">
          Bağlantı
          <input
            readOnly
            value={baglanti}
            onFocus={(e) => e.target.select()}
            className="mt-1 w-full rounded-md border border-cizgi bg-zemin px-3 py-2 text-base"
          />
        </label>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-vurgu-koyu">Son tarihleri takviminize ekleyin</h3>
        <p className="mt-2 text-base text-metin-ikincil">
          {yaklasanlar.length > 0
            ? `${yaklasanlar.length} son tarih, 7 gün ve 1 gün önce hatırlatmayla takviminize eklenir.`
            : "Takvime eklenecek yaklaşan bir son tarih yok."}
        </p>
        <button type="button" onClick={takvimIndir} disabled={yaklasanlar.length === 0} className={`${dugme} mt-4`}>
          Takvime ekle (.ics)
        </button>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-vurgu-koyu">Kâğıda dökün</h3>
        <p className="mt-2 text-base text-metin-ikincil">
          Tüm adımlar, ayrıntılarıyla birlikte yazdırılır. Yazdırma ekranında &ldquo;PDF olarak kaydet&rdquo;i seçerek
          dosya olarak da saklayabilirsiniz.
        </p>
        <button type="button" onClick={listeyiYazdir} className={`${dugme} mt-4`}>
          Tüm listeyi yazdır
        </button>
      </div>

      <p role="status" aria-live="polite" className="text-base text-vurgu-koyu">
        {durum}
      </p>
    </div>
  );
}
