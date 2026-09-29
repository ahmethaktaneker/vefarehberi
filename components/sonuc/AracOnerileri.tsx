import Link from "next/link";
import { olay } from "@/lib/analitik";
import { pakette, type AracOnerisi } from "@/lib/araclar";

/** Liste sayfası: cevaplara ve listedeki adımlara göre seçilmiş araçlar; son tarihi yakın olan önce. */
export function AracOnerileri({ oneriler }: { oneriler: AracOnerisi[] }) {
  if (oneriler.length === 0) return null;
  return (
    <section aria-labelledby="araclar-baslik">
      <h2 id="araclar-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu">
        Size yardımcı olacak araçlar
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {oneriler.map(({ arac, neden, kalanGun }) => (
          <li key={arac.id}>
            <Link
              href={arac.href}
              onClick={() => olay("arac_onerisi_tiklandi", { arac: arac.id })}
              className={`flex h-full flex-col rounded-2xl bg-yuzey p-4 no-underline shadow-kart transition-shadow hover:shadow-yuksek ${
                kalanGun !== undefined && kalanGun <= 30 ? "border-l-4 border-uyari" : ""
              }`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-semibold text-vurgu-koyu">{arac.ad}</span>
                {pakette(arac.id) && (
                  <span className="shrink-0 rounded-full bg-altin-acik px-2.5 py-0.5 text-base text-altin-koyu">Pakette</span>
                )}
              </span>
              <span className="mt-1 text-base text-metin">{neden}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
