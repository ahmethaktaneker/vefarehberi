"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import type { PaketOnerisi } from "@/lib/araclar";
import { epostaTemizle } from "@/lib/eposta";
import { EPOSTA_TOPLAMA_AKTIF } from "@/lib/marka";
import type { Paket } from "@/lib/paket";

type PaketId = Paket["paketler"][number]["id"];

/**
 * Paket kartı: ilgi testi (Brief 10), fiyat gösterilmez. Cevaplara göre önerilen paket öne çıkar ve
 * "sizin durumunuzda" nedenleriyle anlatılır. Ekranı kaplamaz, kendiliğinden açılmaz, kapatılabilir.
 * Öneri yoksa (mal da borç da yoksa) hiç gösterilmez.
 */
export function PaketKarti({ paket, riza, oneri }: { paket: Paket; riza: { surum: string; metin: string }; oneri: PaketOnerisi }) {
  const [kapali, setKapali] = useState(false);
  const [secilen, setSecilen] = useState<PaketId | null>(null);
  const kartRef = useRef<HTMLDivElement>(null);
  const goruldu = useRef(false);

  useEffect(() => {
    const el = kartRef.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(([g]) => {
      if (g.isIntersecting && !goruldu.current) {
        goruldu.current = true;
        olay("paket_karti_goruldu", { paket: oneri.paket });
      }
    });
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [oneri.paket]);

  if (kapali) return null;
  const sirali = [...paket.paketler].sort((a, b) => (a.id === oneri.paket ? -1 : b.id === oneri.paket ? 1 : 0));

  return (
    <section ref={kartRef} aria-labelledby="paket-baslik" className="rounded-2xl border border-altin/60 bg-yuzey p-5 shadow-kart sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id="paket-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu">
          İşinizi kolaylaştıracak paketler
        </h2>
        <button
          type="button"
          onClick={() => setKapali(true)}
          aria-label="Paket kartını kapat"
          className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xl text-metin-ikincil hover:bg-bilgi-acik"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {sirali.map((p) => {
          const onerilen = p.id === oneri.paket;
          return (
            <div key={p.id} className={`flex flex-col rounded-xl p-4 ${onerilen ? "border-2 border-vurgu-koyu bg-vurgu-acik/60" : "border border-cizgi"}`}>
              {onerilen && <p className="mb-2 self-start rounded-full bg-vurgu-koyu px-3 py-0.5 text-base font-bold text-white">Sizin için önerilen</p>}
              <h3 className="font-serif text-xl font-semibold">{p.ad}</h3>
              <p className="mt-1 text-base text-metin-ikincil">{p.aciklama}</p>
              {onerilen && oneri.nedenler.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {oneri.nedenler.map((n) => (
                    <li key={n} className="flex gap-2 text-base">
                      <span aria-hidden="true" className="text-altin-koyu">
                        ✓
                      </span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              )}
              <ul className="mt-3 list-disc space-y-1 pl-5 text-base">
                {p.icerik.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSecilen(p.id);
                    olay("paket_tiklandi", { paket: p.id, onerilen: onerilen ? "evet" : "hayir" });
                  }}
                  className={`dugme ${onerilen ? "dugme-birincil" : "dugme-ikincil"} w-full`}
                >
                  {p.ad}&apos;ni istiyorum
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {secilen && (
        <div role="status" className="mt-4 space-y-2 rounded-xl bg-bilgi-acik px-4 py-3 text-base">
          <p>{paket.yakinda_metni}</p>
          {EPOSTA_TOPLAMA_AKTIF ? <EpostaFormu paket={secilen} riza={riza} /> : <p className="text-metin-ikincil">{paket.eposta_yakinda_metni}</p>}
        </div>
      )}

      <p className="mt-4 text-sm text-metin-ikincil">
        Erişim kodunuz varsa ilgili aracı açıp kodu girin:{" "}
        <Link href="/beyanname" className="underline underline-offset-2">
          beyanname
        </Link>
        ,{" "}
        <Link href="/reddi-miras" className="underline underline-offset-2">
          reddi miras
        </Link>
        .
      </p>
    </section>
  );
}

function EpostaFormu({ paket, riza }: { paket: PaketId; riza: { surum: string; metin: string } }) {
  const [eposta, setEposta] = useState("");
  const [onay, setOnay] = useState(false);
  const [site, setSite] = useState("");
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam" | "hata">("bos");
  const [hata, setHata] = useState("");

  if (durum === "tamam") {
    return <p className="font-semibold text-vurgu-koyu">Teşekkürler. Paket açıldığında size haber vereceğiz.</p>;
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    const temiz = epostaTemizle(eposta);
    if (!temiz) return setHata("Lütfen geçerli bir e-posta adresi yazın.");
    if (!onay) return setHata("Devam etmek için açık rıza kutusunu işaretleyin.");
    setHata("");
    setDurum("gonderiliyor");
    try {
      const yanit = await fetch("/api/paket-ilgi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: temiz, paket, riza: true, riza_surumu: riza.surum, site }),
      });
      if (!yanit.ok) throw new Error(String(yanit.status));
      setDurum("tamam");
      olay("eposta_birakildi", { paket });
    } catch {
      setDurum("hata");
      setHata("Şu an kaydedemedik. Lütfen daha sonra tekrar deneyin.");
    }
  }

  return (
    <form onSubmit={gonder} noValidate className="space-y-3 pt-2">
      <p>Paket açıldığında ilk haber alanlardan olmak isterseniz e-postanızı bırakın.</p>
      <label htmlFor="paket-eposta" className="block font-semibold">
        E-posta adresiniz
      </label>
      <input
        id="paket-eposta"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={eposta}
        onChange={(e) => setEposta(e.target.value)}
        className="min-h-12 w-full rounded-lg border border-cizgi bg-yuzey px-4 text-lg"
      />
      {/* Botlar için gizli alan */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        className="hidden"
      />
      <label className="flex cursor-pointer items-start gap-3 text-base">
        <input type="checkbox" checked={onay} onChange={(e) => setOnay(e.target.checked)} className="mt-1 size-5 shrink-0 accent-vurgu" />
        <span>
          {riza.metin.trim()}{" "}
          <a href="/aydinlatma-metni" target="_blank" className="text-vurgu-koyu underline underline-offset-4">
            Aydınlatma metni
          </a>
        </span>
      </label>
      {hata && <p className="text-uyari">{hata}</p>}
      <button type="submit" disabled={durum === "gonderiliyor"} className="dugme dugme-birincil">
        {durum === "gonderiliyor" ? "Kaydediliyor…" : "Haber ver"}
      </button>
    </form>
  );
}
