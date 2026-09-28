/** Pratik bir hatırlatma veya taslak notu için sakin bir kutu. */
export function TaslakNotu({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="rounded-xl border-l-4 border-altin bg-altin-acik px-4 py-3 text-base">
      {children}
    </div>
  );
}
