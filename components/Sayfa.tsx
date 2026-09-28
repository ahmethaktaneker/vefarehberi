/** İç sayfalar için ortak yerleşim: başlık ve okunabilir genişlikte içerik. */
export function Sayfa({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold leading-tight">{baslik}</h1>
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}
