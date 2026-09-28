import Link from "next/link";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";
import { HukukiUyari } from "@/components/HukukiUyari";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-cizgi bg-bilgi-acik">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <HukukiUyari />
        <nav aria-label="Alt bağlantılar" className="flex flex-wrap gap-x-6 gap-y-2 text-base">
          <Link href="/gizlilik" className="text-vurgu-koyu underline underline-offset-4">
            Gizlilik
          </Link>
          <Link href="/aydinlatma-metni" className="text-vurgu-koyu underline underline-offset-4">
            Aydınlatma metni
          </Link>
        </nav>
        <p className="text-sm text-metin-ikincil">
          {URUN_ADI} · {URUN_ALT_BASLIK}. Resmi bir kurum sitesi değildir.
        </p>
      </div>
    </footer>
  );
}
