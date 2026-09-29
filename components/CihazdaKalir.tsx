/**
 * Hassas bilgi istenen yerlerdeki güvence notu: yazılan bilgi sunucumuza gelmez, yalnızca
 * kullanıcının cihazında kalır. Araçlar, hesaplayıcılar ve dilekçeler için doğrudur; e-posta formunda
 * kullanılmaz. "kutu" sayfa ya da adım başında renkli bir kutu olarak, yoksa alanın altında satır olarak çıkar.
 */
export function CihazdaKalir({ children, kutu = false, className = "" }: { children?: React.ReactNode; kutu?: boolean; className?: string }) {
  return (
    <p
      className={`flex items-start gap-2.5 text-base ${
        kutu ? "rounded-xl bg-vurgu-acik px-4 py-3 font-semibold text-vurgu-koyu" : "text-metin-ikincil"
      } ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className={`mt-0.5 shrink-0 fill-current ${kutu ? "size-5" : "size-[1.1rem]"}`}>
        <path d="M10 1.5a4.5 4.5 0 0 0-4.5 4.5v2H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-.5V6A4.5 4.5 0 0 0 10 1.5Zm-3 4.5a3 3 0 1 1 6 0v2H7V6Z" />
      </svg>
      <span>{children ?? "Bunu biz görmüyoruz; yalnızca bu cihazda kalır."}</span>
    </p>
  );
}
