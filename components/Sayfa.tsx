/** İç sayfalar için ortak yerleşim: başlık ve okunabilir genişlikte içerik. */
export function Sayfa({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14">
      <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">{baslik}</h1>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}
