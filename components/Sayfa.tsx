import Link from "next/link";

export type Kirinti = { href: string; ad: string };

/**
 * İç sayfalar için ortak yerleşim: başlık ve okunabilir genişlikte içerik. `yol` verilirse başlığın
 * üstünde "Ana sayfa › Rehberler › …" gezinme yolu çıkar (arama sonuçlarındaki yol bilgisiyle aynıdır).
 */
export function Sayfa({ baslik, yol, children }: { baslik: string; yol?: Kirinti[]; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14">
      {yol && yol.length > 0 && (
        <nav aria-label="Bulunduğunuz yer" className="mb-3 text-base text-metin-ikincil">
          <ol className="flex flex-wrap items-center gap-x-2">
            {yol.map((k) => (
              <li key={k.href} className="flex items-center gap-x-2">
                <Link href={k.href} className="inline-block py-1 underline underline-offset-4 hover:text-vurgu">
                  {k.ad}
                </Link>
                <span aria-hidden="true">›</span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">{baslik}</h1>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}
