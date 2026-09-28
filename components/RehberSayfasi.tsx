import Link from "next/link";
import { marked } from "marked";
import { Sayfa } from "@/components/Sayfa";
import { TaslakNotu } from "@/components/TaslakNotu";
import type { Sayfa as SayfaIcerigi } from "@/lib/icerik/metinler";

/** content/sayfalar altındaki Markdown rehber sayfaları. İçerik yalnızca projenin kendi dosyalarından gelir. */
export function RehberSayfasi({ sayfa, eylem = true }: { sayfa: SayfaIcerigi; eylem?: boolean }) {
  const html = marked.parse(sayfa.govde, { async: false });
  return (
    <Sayfa baslik={sayfa.baslik}>
      {!sayfa.dogrulandi && (
        <TaslakNotu>Bu sayfa taslaktır ve henüz hukuk uzmanı kontrolünden geçmedi.</TaslakNotu>
      )}
      <div className="metin" dangerouslySetInnerHTML={{ __html: html }} />
      {eylem && (
      <Link
        href="/liste"
        className="inline-flex min-h-12 items-center justify-center rounded-lg bg-vurgu px-7 py-3 text-lg font-semibold text-white hover:bg-vurgu-koyu"
      >
        Listemi oluştur
      </Link>
      )}
      <details className="text-sm text-metin-ikincil">
        <summary className="cursor-pointer">Kaynaklar ve son kontrol</summary>
        <ul className="mt-2 space-y-1 break-words">
          {sayfa.kaynak.map((k) => (
            <li key={k}>
              {k.startsWith("http") ? (
                <a href={k} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {new URL(k).hostname.replace(/^www\./, "")}
                </a>
              ) : (
                k
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2">Son kontrol: {sayfa.son_kontrol.split("-").reverse().join(".")}</p>
      </details>
    </Sayfa>
  );
}
