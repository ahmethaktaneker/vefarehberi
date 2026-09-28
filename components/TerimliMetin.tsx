"use client";

import { useState } from "react";
import type { Terim } from "@/lib/icerik/sema";
import { terimleriIsaretle } from "@/lib/sozluk";

/** Metindeki zor terimlere dokununca kısa açıklama açar. */
export function TerimliMetin({ metin, sozluk }: { metin: string; sozluk: Terim[] }) {
  return (
    <>
      {terimleriIsaretle(metin, sozluk).map((p, i) =>
        typeof p === "string" ? p : <TerimAciklamasi key={i} metin={p.metin} terim={p.terim} />,
      )}
    </>
  );
}

function TerimAciklamasi({ metin, terim }: { metin: string; terim: Terim }) {
  const [acik, setAcik] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(!acik)}
        aria-expanded={acik}
        className="inline cursor-help py-1 text-left text-vurgu-koyu underline decoration-dotted decoration-2 underline-offset-4"
      >
        {metin}
        <span className="sr-only"> (açıklamayı {acik ? "kapat" : "göster"})</span>
      </button>
      {acik && (
        <span role="note" className="my-2 block rounded-md border-l-4 border-vurgu bg-vurgu-acik px-3 py-2 text-base text-metin">
          <strong>{terim.terim}:</strong> {terim.aciklama}
        </span>
      )}
    </>
  );
}
