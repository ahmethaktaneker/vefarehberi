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

const telefonda = () => window.matchMedia("(max-width: 639.98px)").matches;
const hareketAzaltilmis = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Panelin konumu ve arka planın koyuluğu (1 tam, 0 hiç); arka plan --karartma değişkenini okur. */
function konumla(d: HTMLDialogElement, transform: string, transition: string, karartma?: number) {
  d.style.transition = transition;
  d.style.transform = transform;
  if (karartma === undefined) d.style.removeProperty("--karartma");
  else d.style.setProperty("--karartma", String(karartma));
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
    if (acik && !d.open) {
      konumla(d, "", "");
      d.showModal();
    }
    if (!acik && d.open) d.close();
    if (acik) icRef.current?.scrollTo({ top: 0 });
  }, [acik, baslik]);

  /**
   * Telefonda panel aşağı kayarak kapanır; geniş ekranda ve hareket azaltma açıkken hemen kapanır.
   * Kapat düğmesi, arka plana dokunma ve aşağı çekme aynı kapanışı kullanır.
   */
  function kaydirarakKapat() {
    const d = ref.current;
    if (!d || !d.open || !telefonda() || hareketAzaltilmis()) return onKapat();
    konumla(d, "translateY(100%)", "transform 220ms cubic-bezier(0.4, 0, 1, 1)", 0);
    let bitti = false;
    const kapat = () => {
      if (bitti) return;
      bitti = true;
      onKapat();
    };
    d.addEventListener("transitionend", kapat, { once: true });
    setTimeout(kapat, 300);
  }

  // Aşağı çekme: panel parmağı izler, arka plan açılır; bırakınca yeterince çekildiyse ya da hızlıca
  // aşağı savrulduysa kapanır, değilse yerine döner. İçerik alanında yalnızca en üstteyken çalışır.
  const cekme = useRef<{ y: number; fark: number; zaman: number; hiz: number } | null>(null);
  function cekmeyeBasla(e: React.TouchEvent, icerikten: boolean) {
    if (!telefonda() || (icerikten && (icRef.current?.scrollTop ?? 0) > 0)) return;
    cekme.current = { y: e.touches[0].clientY, fark: 0, zaman: e.timeStamp, hiz: 0 };
  }
  function cekiliyor(e: React.TouchEvent) {
    const c = cekme.current;
    const d = ref.current;
    if (!c || !d) return;
    const y = e.touches[0].clientY;
    if ((icRef.current?.scrollTop ?? 0) > 0) {
      c.y = y;
      c.fark = 0;
      konumla(d, "", "none");
      return;
    }
    const yeni = Math.max(0, y - c.y);
    const sure = e.timeStamp - c.zaman;
    if (sure > 0) c.hiz = (yeni - c.fark) / sure;
    c.fark = yeni;
    c.zaman = e.timeStamp;
    konumla(d, yeni ? `translateY(${yeni}px)` : "", "none", 1 - Math.min(yeni / d.offsetHeight, 1));
  }
  function cekmeBitti() {
    const c = cekme.current;
    const d = ref.current;
    cekme.current = null;
    if (!c || !d || c.fark === 0) return;
    if (c.fark > d.offsetHeight * 0.3 || (c.hiz > 0.5 && c.fark > 30)) {
      kaydirarakKapat();
    } else {
      konumla(d, "", "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)", 1);
    }
  }

  return (
    <dialog
      ref={ref}
      className="panel"
      aria-labelledby="panel-baslik"
      onClose={onKapat}
      onCancel={(e) => {
        e.preventDefault();
        kaydirarakKapat();
      }}
      onClick={(e) => {
        // Arka plana dokununca kapan
        if (e.target === ref.current) kaydirarakKapat();
      }}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div
          onTouchStart={(e) => cekmeyeBasla(e, false)}
          onTouchMove={cekiliyor}
          onTouchEnd={cekmeBitti}
          onTouchCancel={cekmeBitti}
          className="touch-none border-b border-cizgi bg-yuzey px-5 pt-3 pb-3 sm:touch-auto sm:rounded-t-[1.25rem]"
        >
          <span aria-hidden="true" className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-cizgi sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <h2 id="panel-baslik" className="min-w-0 font-serif text-xl font-semibold leading-snug text-vurgu-koyu">
              {baslik}
            </h2>
            <button type="button" onClick={kaydirarakKapat} className="dugme dugme-ikincil min-h-11 shrink-0 px-4 py-2 text-base">
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
