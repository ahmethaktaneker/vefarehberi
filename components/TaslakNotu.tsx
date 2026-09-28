/** Henüz avukat kontrolünden geçmemiş ya da hazırlanmakta olan içerik için sakin bir not. */
export function TaslakNotu({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="rounded-lg border border-cizgi bg-bilgi-acik px-4 py-3 text-base">
      {children}
    </div>
  );
}
