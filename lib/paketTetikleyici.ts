import { kosulSaglaniyor } from "@/lib/kurallar/kosul";
import type { Liste } from "@/lib/kurallar/liste";
import type { Paket } from "@/lib/paket";
import { gecerliCevaplar, type Cevaplar } from "@/lib/sorular";

/** Tarayıcıda çalışır. İlk eşleşen tetikleyiciyi döner; yoksa "genel". */
export function paketTetikleyici(paket: Paket, cevaplar: Cevaplar, liste: Liste): { id: string; metin?: string } {
  const c = gecerliCevaplar(cevaplar);
  for (const t of paket.tetikleyiciler) {
    if (t.id === "veraset_30_gun") {
      const b = liste.adimlar.find((a) => a.id === "veraset_beyannamesi")?.sonTarihBilgisi;
      if (b && !b.gecti && b.kalanGun <= 30) return t;
    } else if (t.kosul && kosulSaglaniyor(t.kosul, c)) {
      return t;
    }
  }
  return { id: "genel" };
}
