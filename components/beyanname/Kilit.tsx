"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { olay } from "@/lib/analitik";

/** Ücretli aracın kilit ekranı: ne işe yaradığını anlatır, erişim kodu ister. */
export function Kilit({ urun, faydalar }: { urun: string; faydalar: string[] }) {
  const router = useRouter();
  const [kod, setKod] = useState("");
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "hata" | "sunucu">("bos");

  useEffect(() => olay("kilit_goruldu", { urun }), [urun]);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setDurum("gonderiliyor");
    try {
      const yanit = await fetch("/api/erisim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod }),
      });
      if (yanit.ok) {
        olay("erisim_kodu_girildi");
        router.refresh();
        return;
      }
      setDurum(yanit.status === 403 ? "hata" : "sunucu");
    } catch {
      setDurum("sunucu");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6">
        <h2 className="font-serif text-2xl font-semibold text-vurgu-koyu">Bu araç ne yapar?</h2>
        <ul className="mt-4 space-y-3">
          {faydalar.map((f) => (
            <li key={f} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 text-altin-koyu">
                ✓
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-base text-metin-ikincil">
          Bu araç Beyanname Paketi&apos;nin parçasıdır ve çok yakında satışa açılacak. Yapılacaklar listeniz, son tarihler ve
          vergi hesaplayıcı her zaman ücretsiz kalır.
        </p>
      </div>

      <form onSubmit={gonder} className="space-y-3 rounded-2xl border border-cizgi bg-yuzey p-5 sm:p-6">
        <label htmlFor="erisim-kodu" className="block font-semibold">
          Erişim kodunuz varsa girin
        </label>
        <input
          id="erisim-kodu"
          value={kod}
          onChange={(e) => {
            setKod(e.target.value);
            if (durum === "hata") setDurum("bos");
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="VR-XXXX-XXXX-XXXX"
          aria-invalid={durum === "hata" ? true : undefined}
          aria-describedby="erisim-durum"
          className="min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 font-mono text-lg tracking-wider uppercase"
        />
        <p id="erisim-durum" role="status" className="text-base">
          {durum === "hata" && <span className="text-uyari">Bu kod geçerli değil. Harfleri kontrol edip tekrar deneyin.</span>}
          {durum === "sunucu" && <span className="text-uyari">Şu an doğrulanamadı. Biraz sonra tekrar deneyin.</span>}
        </p>
        <button type="submit" disabled={durum === "gonderiliyor" || kod.trim().length < 8} className="dugme dugme-birincil disabled:opacity-60">
          {durum === "gonderiliyor" ? "Kontrol ediliyor…" : "Aracı aç"}
        </button>
      </form>
    </div>
  );
}
