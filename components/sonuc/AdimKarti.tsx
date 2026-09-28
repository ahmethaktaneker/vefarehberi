"use client";

import type { Belge } from "@/lib/icerik/sema";
import type { HesaplanmisAdim, TutarBilgisi } from "@/lib/kurallar/liste";
import { tarihMetni } from "@/lib/kurallar/tarih";

/** Özet bölümlerinden bir karta gidilirken kartı açar. */
export function kartaGit(id: string) {
  const detay = document.getElementById(`adim-${id}`)?.querySelector("details");
  if (detay) detay.open = true;
}

const paraBicimi = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TutarSatiri({ bilgi }: { bilgi: TutarBilgisi }) {
  if (bilgi.durum === "guncel_degil") {
    return <p className="mt-1 text-base text-metin-ikincil">Güncel tutar kontrol ediliyor. Resmi kaynaktan teyit edin.</p>;
  }
  return (
    <p className="mt-1 text-base">
      Genel bilgi olarak {bilgi.donem.slice(0, 4)} tutarı: <strong>{paraBicimi.format(bilgi.tutar)} TL</strong>{" "}
      <span className="text-metin-ikincil">(kaynak: {bilgi.kaynak})</span>
    </p>
  );
}

function KontrolEdiliyor() {
  return (
    <span className="inline-block rounded-full border border-cizgi bg-bilgi-acik px-2.5 py-0.5 text-sm font-normal text-metin-ikincil">
      Kontrol ediliyor
      <span className="sr-only">: bu bilgi henüz hukuk uzmanı kontrolünden geçmedi</span>
    </span>
  );
}

export function AdimKarti({
  adim: a,
  belgeler,
  yapildi,
  onYapildi,
}: {
  adim: HesaplanmisAdim;
  belgeler: Record<string, Belge>;
  yapildi: boolean;
  onYapildi: (v: boolean) => void;
}) {
  const genelIpuclari = a.ipuclari.filter((i) => i.tur === "genel");
  const deneyimler = a.ipuclari.filter((i) => i.tur === "deneyim");

  return (
    <li id={`adim-${a.id}`} className="scroll-mt-4 rounded-lg border border-cizgi bg-yuzey">
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={yapildi}
          onChange={(e) => onYapildi(e.target.checked)}
          aria-label={`Yaptım: ${a.baslik}`}
          className="mt-1 size-6 shrink-0 cursor-pointer accent-vurgu"
        />
        <details className="group min-w-0 flex-1">
          <summary className="cursor-pointer list-none">
            <span className={`text-lg font-semibold ${yapildi ? "text-metin-ikincil" : ""}`}>{a.baslik}</span>
            <span className="mt-1 flex flex-wrap items-center gap-2">
              {a.oncelik === "kritik" && (
                <span className="rounded-full bg-uyari-acik px-2.5 py-0.5 text-sm text-uyari">Öncelikli</span>
              )}
              {!a.dogrulandi && <KontrolEdiliyor />}
              {yapildi && <span className="text-sm text-vurgu-koyu">Yapıldı</span>}
              <span className="text-sm text-vurgu-koyu underline underline-offset-4 group-open:hidden">Ayrıntılar</span>
              <span className="hidden text-sm text-vurgu-koyu underline underline-offset-4 group-open:inline">Kapat</span>
            </span>
          </summary>

          <dl className="mt-4 space-y-4">
            {a.belirsiz && (
              <div className="rounded-md bg-bilgi-acik px-3 py-2 text-base">
                <dt className="sr-only">Not</dt>
                <dd>Bu adımı, bir soruya &ldquo;Bilmiyorum&rdquo; dediğiniz için gösteriyoruz. Durumunuza göre geçerli olmayabilir.</dd>
              </div>
            )}
            <Alan etiket="Ne?">{a.ne}</Alan>
            {a.neden && <Alan etiket="Neden önemli?">{a.neden}</Alan>}
            {a.sonTarihBilgisi && (
              <Alan etiket="Son tarih">
                {tarihMetni(a.sonTarihBilgisi.tarih)}
                {a.sonTarihBilgisi.gecti && " (süre geçmiş görünüyor)"}
              </Alan>
            )}
            {a.tutarBilgisi && (
              <Alan etiket="Tutar">
                <TutarSatiri bilgi={a.tutarBilgisi} />
              </Alan>
            )}
            {a.nereye && <Alan etiket="Nereye?">{a.nereye}</Alan>}
            {a.belgeler.length > 0 && (
              <Alan etiket="Hangi belgeler?">
                <ul className="list-disc space-y-1 pl-5">
                  {a.belgeler.map((b) => (
                    <li key={b}>{belgeler[b]?.ad ?? b}</li>
                  ))}
                </ul>
              </Alan>
            )}
            {a.cevrimici && <Alan etiket="Çevrimiçi yapılabilir mi?">{a.cevrimici}</Alan>}
            {genelIpuclari.length > 0 && (
              <Alan etiket="İpucu">
                <ul className="space-y-2">
                  {genelIpuclari.map((i) => (
                    <li key={i.metin}>{i.metin}</li>
                  ))}
                </ul>
              </Alan>
            )}
            {deneyimler.length > 0 && (
              <Alan etiket="Kullanıcı deneyimi">
                <p className="mb-2 text-sm text-metin-ikincil">Resmi bilgi değildir; başka kullanıcıların anlattıklarıdır.</p>
                <ul className="space-y-2">
                  {deneyimler.map((i) => (
                    <li key={i.metin} className="border-l-4 border-cizgi pl-3">
                      {i.metin}
                    </li>
                  ))}
                </ul>
              </Alan>
            )}
            {a.uyari && (
              <div className="rounded-md border-l-4 border-vurgu bg-vurgu-acik px-3 py-2">
                <dt className="sr-only">Dikkat</dt>
                <dd>{a.uyari}</dd>
              </div>
            )}
            {a.baglantilar.length > 0 && (
              <Alan etiket="Bağlantılar">
                <ul className="space-y-1">
                  {a.baglantilar.map((b) => (
                    <li key={b.url}>
                      <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-vurgu-koyu underline underline-offset-4">
                        {b.ad}
                        <span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Alan>
            )}
          </dl>

          <details className="mt-5 text-sm text-metin-ikincil">
            <summary className="cursor-pointer">Kaynaklar ve son kontrol</summary>
            <ul className="mt-2 space-y-1 break-words">
              {a.kaynak.map((k) => (
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
            <p className="mt-2">Son kontrol: {tarihMetni(a.son_kontrol)}</p>
          </details>
        </details>
      </div>
    </li>
  );
}

function Alan({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold">{etiket}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
