"use client";

import { createContext, useContext, useEffect, useRef } from "react";

/** Liste sayfasında açılabilen paneller. */
export type PanelDurumu =
  | { tur: "adim"; id: string }
  | { tur: "kurum"; id?: string }
  | { tur: "odemeler" | "riskler" | "belgeler" | "nereye" | "paylas" };

const PanelBaglami = createContext<(p: PanelDurumu) => void>(() => {});
export const PanelSaglayici = PanelBaglami.Provider;

/** Herhangi bir bileşenden panel açmak için. */
export function usePanelAc() {
  return useContext(PanelBaglami);
}

/**
 * Alttan açılan panel. Tarayıcının kendi <dialog> öğesi: Esc ile kapanır, odak panel içinde kalır,
 * arkadaki sayfa kaydırılmaz.
 */
export function Panel({
  acik,
  baslik,
  onKapat,
  children,
}: {
  acik: boolean;
  baslik: string;
  onKapat: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const icRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (acik && !d.open) d.showModal();
    if (!acik && d.open) d.close();
    if (acik) icRef.current?.scrollTo({ top: 0 });
  }, [acik, baslik]);

  // Telefonda paneli aşağı çekerek kapatma. İçerik alanında yalnızca en üstteyken çalışır; aksi hâlde
  // parmak hareketi içeriği kaydırır.
  const cekme = useRef<{ y: number; fark: number } | null>(null);
  function cekmeyeBasla(e: React.TouchEvent, icerikten: boolean) {
    if (icerikten && (icRef.current?.scrollTop ?? 0) > 0) return;
    cekme.current = { y: e.touches[0].clientY, fark: 0 };
  }
  function cekiliyor(e: React.TouchEvent) {
    const c = cekme.current;
    const d = ref.current;
    if (!c || !d) return;
    const y = e.touches[0].clientY;
    if ((icRef.current?.scrollTop ?? 0) > 0) {
      c.y = y;
      c.fark = 0;
      d.style.transform = "";
      return;
    }
    c.fark = Math.max(0, y - c.y);
    d.style.transition = "none";
    d.style.transform = c.fark ? `translateY(${c.fark}px)` : "";
  }
  function cekmeBitti() {
    const c = cekme.current;
    const d = ref.current;
    cekme.current = null;
    if (!c || !d) return;
    d.style.transition = "transform 200ms ease-out";
    d.style.transform = "";
    if (c.fark > 90) onKapat();
  }

  return (
    <dialog
      ref={ref}
      className="panel"
      aria-labelledby="panel-baslik"
      onClose={onKapat}
      onClick={(e) => {
        // Arka plana dokununca kapan
        if (e.target === ref.current) onKapat();
      }}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div
          onTouchStart={(e) => cekmeyeBasla(e, false)}
          onTouchMove={cekiliyor}
          onTouchEnd={cekmeBitti}
          onTouchCancel={cekmeBitti}
          className="border-b border-cizgi bg-yuzey px-5 pt-3 pb-3 sm:rounded-t-[1.25rem]"
        >
          <span aria-hidden="true" className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-cizgi sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <h2 id="panel-baslik" className="min-w-0 font-serif text-xl font-semibold leading-snug text-vurgu-koyu">
              {baslik}
            </h2>
            <button type="button" onClick={onKapat} className="dugme dugme-ikincil min-h-11 shrink-0 px-4 py-2 text-base">
              Kapat
            </button>
          </div>
        </div>
        <div
          ref={icRef}
          onTouchStart={(e) => cekmeyeBasla(e, true)}
          onTouchMove={cekiliyor}
          onTouchEnd={cekmeBitti}
          onTouchCancel={cekmeBitti}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-8"
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
