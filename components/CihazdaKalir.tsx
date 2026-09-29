/**
 * Hassas bilgi istenen yerlerin altındaki güvence notu: yazılan bilgi sunucumuza gelmez, yalnızca
 * kullanıcının cihazında kalır. Beyanname aracı ve dilekçeler için doğrudur; e-posta formunda kullanılmaz.
 */
export function CihazdaKalir({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-sm text-metin-ikincil ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 fill-current">
        <path d="M10 1.5a4.5 4.5 0 0 0-4.5 4.5v2H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-.5V6A4.5 4.5 0 0 0 10 1.5Zm-3 4.5a3 3 0 1 1 6 0v2H7V6Z" />
      </svg>
      <span>{children ?? "Bunu biz görmüyoruz; yalnızca bu cihazda kalır."}</span>
    </p>
  );
}
