"use client";

import { useEffect, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import type { PaketOnerisi } from "@/lib/araclar";
import { epostaTemizle } from "@/lib/eposta";
import { EPOSTA_TOPLAMA_AKTIF } from "@/lib/marka";
import type { Paket } from "@/lib/paket";

type PaketId = Paket["paketler"][number]["id"];
type IlgiKonusu = PaketId | "yenilikler";

/**
 * Paketler: liste sayfasının en altında sade bir liste (ilgi testi, Brief 10). Fiyat yok; düğme "Açılınca
 * haber ver". Cevaplara göre önerilen paket işaretlenir. Gizli araçlara bağlı maddeler görünmez; maddesi
 * kalmayan paket listelenmez.
 */
export function PaketKarti({ paket, riza, oneri }: { paket: Paket; riza: { surum: string; metin: string }; oneri: PaketOnerisi }) {
  const [secilen, setSecilen] = useState<PaketId | null>(null);
  const kartRef = useRef<HTMLElement>(null);
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

  // Satışta olmayan (sayfası gizli) araçlar da tanıtım için pakette anlatılır.
  const paketler = [...paket.paketler].sort((a, b) => (a.id === oneri.paket ? -1 : b.id === oneri.paket ? 1 : 0));
  if (paketler.length === 0) return null;

  return (
    <section ref={kartRef} aria-labelledby="paket-baslik" className="border-t border-cizgi pt-8">
      <h2 id="paket-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu">
        Paketler
      </h2>
      <p className="mt-1 text-base text-metin-ikincil">İşinizi kolaylaştıran ek araçlar. Çok yakında açılıyor.</p>

      <ul className="mt-4 divide-y divide-cizgi">
        {paketler.map((p) => {
          const onerilen = p.id === oneri.paket;
          return (
            <li key={p.id} className="py-5 first:pt-2">
              <h3 className="flex flex-wrap items-center gap-2 font-serif text-xl font-semibold">
                {p.ad}
                {onerilen && <span className="rounded-full bg-vurgu-acik px-3 py-0.5 font-sans text-base font-bold text-vurgu-koyu">Sizin için önerilen</span>}
              </h3>
              <p className="mt-1 text-base text-metin-ikincil">{p.aciklama}</p>
              {onerilen && oneri.nedenler.length > 0 && (
                <ul className="mt-3 space-y-1">
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
                  <li key={i.metin}>{i.metin}</li>
                ))}
              </ul>
              {secilen === p.id ? (
                <div role="status" className="mt-4 space-y-2 rounded-xl bg-bilgi-acik px-4 py-3 text-base">
                  <p>{paket.yakinda_metni}</p>
                  {EPOSTA_TOPLAMA_AKTIF ? <EpostaFormu paket={p.id} riza={riza} /> : <p className="text-metin-ikincil">{paket.eposta_yakinda_metni}</p>}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSecilen(p.id);
                    olay("paket_tiklandi", { paket: p.id, onerilen: onerilen ? "evet" : "hayir" });
                  }}
                  className="dugme dugme-ikincil mt-4 min-h-11 px-5 py-2 text-base"
                >
                  Açılınca haber ver
                </button>
              )}
            </li>
          );
        })}
      </ul>

    </section>
  );
}

export function EpostaFormu({ paket, riza }: { paket: IlgiKonusu; riza: { surum: string; metin: string } }) {
  const [eposta, setEposta] = useState("");
  const [onay, setOnay] = useState(false);
  const [site, setSite] = useState("");
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam" | "hata">("bos");
  const [hata, setHata] = useState("");

  if (durum === "tamam") {
    return <p className="font-semibold text-vurgu-koyu">Teşekkürler. Kullanıma açıldığında size haber vereceğiz.</p>;
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
      <p className="text-sm text-metin-ikincil">
        E-posta adresinizin nasıl işlendiğini, ne kadar saklandığını ve haklarınızı{" "}
        <a href="/aydinlatma-metni" target="_blank" className="text-vurgu-koyu underline underline-offset-4">
          aydınlatma metninde
          <span className="sr-only"> (yeni sekmede açılır)</span>
        </a>{" "}
        anlatıyoruz.
      </p>
      <label className="flex cursor-pointer items-start gap-3 text-base">
        <input type="checkbox" checked={onay} onChange={(e) => setOnay(e.target.checked)} className="mt-1 size-5 shrink-0 accent-vurgu" />
        <span>{riza.metin.trim()}</span>
      </label>
      {hata && <p className="text-uyari">{hata}</p>}
      <button type="submit" disabled={durum === "gonderiliyor"} className="dugme dugme-birincil">
        {durum === "gonderiliyor" ? "Kaydediliyor…" : "Haber ver"}
      </button>
    </form>
  );
}
