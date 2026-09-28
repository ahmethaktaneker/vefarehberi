import Link from "next/link";
import { HukukiUyari } from "@/components/HukukiUyari";
import { hataBildirBaglantisi, URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";

const SUTUNLAR: { baslik: string; baglantilar: [string, string][] }[] = [
  {
    baslik: "Rehberler",
    baglantilar: [
      ["/rehber/vefat-sonrasi-yapilacak-islemler", "Vefat sonrası işlemler"],
      ["/ilk-48-saat", "İlk 48 saat"],
      ["/yurtdisi", "Yurtdışında yaşayanlar"],
      ["/rehber", "Tüm rehberler"],
    ],
  },
  {
    baslik: "Araçlar",
    baglantilar: [
      ["/liste", "Size özel liste"],
      ["/hesaplayici/veraset-vergisi", "Veraset vergisi hesaplayıcı"],
      ["/beyanname", "Beyanname hazırlık aracı"],
      ["/sablonlar", "Dilekçe taslakları"],
      ["/sozluk", "Sözlük"],
    ],
  },
  {
    baslik: "Hakkında",
    baglantilar: [
      ["/hakkimizda", "Hakkımızda"],
      ["/gizlilik", "Gizlilik"],
      ["/aydinlatma-metni", "Aydınlatma metni"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-vurgu-koyu text-white/90">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <p className="font-serif text-xl font-semibold text-white">{URUN_ADI}</p>
          <p className="text-white/75">{URUN_ALT_BASLIK}</p>
        </div>
        <nav aria-label="Alt bağlantılar" className="grid gap-8 sm:grid-cols-3">
          {SUTUNLAR.map((s) => (
            <div key={s.baslik}>
              <h2 className="mb-2 font-bold text-altin">{s.baslik}</h2>
              <ul className="space-y-1">
                {s.baglantilar.map(([href, ad]) => (
                  <li key={href}>
                    <Link href={href} className="inline-block py-1.5 text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                      {ad}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p>
          Bir hata veya eksik mi gördünüz?{" "}
          <a href={hataBildirBaglantisi("Hata bildirimi")} className="font-bold text-white underline underline-offset-4">
            Bize yazın
          </a>
        </p>
        <div className="space-y-2 border-t border-white/15 pt-6 [&_p]:text-white/70">
          <HukukiUyari />
          <p className="text-base">Bağımsız bir projedir; resmi bir kurum sitesi değildir.</p>
        </div>
      </div>
    </footer>
  );
}
