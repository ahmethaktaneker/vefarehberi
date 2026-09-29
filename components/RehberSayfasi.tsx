import Link from "next/link";
import { marked } from "marked";
import { jsonLdMetni } from "@/lib/jsonld";
import { Sayfa } from "@/components/Sayfa";
import { TaslakNotu } from "@/components/TaslakNotu";
import type { Sayfa as SayfaIcerigi } from "@/lib/icerik/metinler";
import { hataBildirBaglantisi, KONTROL_ROZETLERI, SITE_URL } from "@/lib/marka";

const tarih = (t: string) => t.split("-").reverse().join(".");

/**
 * content/sayfalar altındaki Markdown sayfalar (Brief 14). İçerik yalnızca projenin kendi dosyalarından gelir.
 * Sık sorulan sorular hem sayfada gösterilir hem FAQPage yapılandırılmış verisi olarak eklenir.
 */
export function RehberSayfasi({
  sayfa,
  yol,
  eylem = true,
  children,
}: {
  sayfa: SayfaIcerigi;
  /** Sayfanın adresi (ör. "/rehber/cenaze-odenegi"); yapılandırılmış veri için. */
  yol?: string;
  eylem?: boolean;
  /** Gövde metninden sonra gösterilecek araç (ör. hesaplayıcı). */
  children?: React.ReactNode;
}) {
  const html = marked.parse(sayfa.govde, { async: false });
  const yapilandirilmis =
    yol &&
    [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: sayfa.baslik,
        description: sayfa.aciklama,
        dateModified: sayfa.son_kontrol,
        inLanguage: "tr",
        mainEntityOfPage: `${SITE_URL}${yol}`,
      },
      sayfa.sss.length > 0 && {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: sayfa.sss.map((s) => ({
          "@type": "Question",
          name: s.soru,
          acceptedAnswer: { "@type": "Answer", text: s.cevap },
        })),
      },
    ].filter(Boolean);

  return (
    <Sayfa baslik={sayfa.baslik}>
      {yapilandirilmis && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdMetni(yapilandirilmis) }}
        />
      )}
      <p className="text-base text-metin-ikincil">Son güncelleme: {tarih(sayfa.son_kontrol)}</p>
      {KONTROL_ROZETLERI && !sayfa.dogrulandi && (
        <TaslakNotu>
          Bu sayfadaki bilgiler genel bilgilendirme amaçlıdır ve henüz hukuk uzmanı kontrolünden geçmedi. Resmi
          kaynaktan teyit edin.
        </TaslakNotu>
      )}
      <div className="metin" dangerouslySetInnerHTML={{ __html: html }} />
      {children}
      {eylem && (
        <div className="rounded-2xl bg-vurgu p-6 text-white shadow-yuksek">
          <p className="font-serif text-xl">Size özel yapılacaklar listesini ve son tarihlerinizi görmek için birkaç soruya cevap verin.</p>
          <Link
            href="/liste"
            className="dugme mt-4 bg-altin text-vurgu-koyu hover:bg-[#d6b574]"
          >
            Listemi oluştur
          </Link>
        </div>
      )}
      {sayfa.sss.length > 0 && (
        <section aria-labelledby="sss-baslik">
          <h2 id="sss-baslik" className="mb-3 font-serif text-2xl font-semibold text-vurgu-koyu">
            Sık sorulan sorular
          </h2>
          <div className="space-y-2">
            {sayfa.sss.map((s) => (
              <details key={s.soru} className="group rounded-2xl bg-yuzey p-4 shadow-kart open:shadow-yuksek">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-lg font-bold text-vurgu-koyu">
                  {s.soru}
                  <span aria-hidden="true" className="text-xl text-metin-ikincil transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-2">{s.cevap}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      <details className="text-base text-metin-ikincil">
        <summary className="flex min-h-11 cursor-pointer items-center">Kaynaklar</summary>
        <ul className="mt-2 space-y-1 break-words">
          {sayfa.kaynak.map((k) => (
            <li key={k}>
              {k.startsWith("http") ? (
                <a href={k} target="_blank" rel="noopener noreferrer" className="inline-block py-2 underline underline-offset-2">
                  {new URL(k).hostname.replace(/^www\./, "")}
                </a>
              ) : (
                k
              )}
            </li>
          ))}
        </ul>
      </details>
      <p className="text-base text-metin-ikincil">
        Bu sayfada hata veya eksik mi var?{" "}
        <a href={hataBildirBaglantisi(sayfa.baslik)} className="inline-block py-2 text-vurgu-koyu underline underline-offset-4">
          Bize yazın
        </a>
      </p>
    </Sayfa>
  );
}
