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
        <div className="flex items-start justify-between gap-4 border-b border-cizgi bg-yuzey px-5 pt-3 pb-3 sm:rounded-t-[1.25rem]">
          <div className="min-w-0">
            <span aria-hidden="true" className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-cizgi sm:hidden" />
            <h2 id="panel-baslik" className="font-serif text-xl font-semibold leading-snug text-vurgu-koyu">
              {baslik}
            </h2>
          </div>
          <button type="button" onClick={onKapat} className="dugme dugme-ikincil mt-1 min-h-11 shrink-0 px-4 py-2 text-base">
            Kapat
          </button>
        </div>
        <div ref={icRef} className="overflow-y-auto px-5 pt-5 pb-8">
          {children}
        </div>
      </div>
    </dialog>
  );
}
