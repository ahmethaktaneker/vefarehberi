"use client";

import Link from "next/link";
import type { Belge, Kurum, Terim } from "@/lib/icerik/sema";
import { TerimliMetin } from "@/components/TerimliMetin";
import { kurumaGit } from "@/components/sonuc/KurumRehberi";
import { hataBildirBaglantisi, KONTROL_ROZETLERI } from "@/lib/marka";
import type { HesaplanmisAdim, TutarBilgisi } from "@/lib/kurallar/liste";
import { tarihMetni } from "@/lib/kurallar/tarih";

const SABLON_ADLARI: Record<string, string> = {
  banka_bakiye_yazisi: "Bankadan bakiye yazısı talebi",
  abonelik_iptal: "Abonelik iptali ve güvence bedeli iadesi talebi",
  otomatik_odeme_iptal: "Otomatik ödeme talimatlarının iptali talebi",
};

/** Özet bölümlerinden bir karta gidilirken kartı açar. */
export function kartaGit(id: string) {
  const detay = document.getElementById(`adim-${id}`)?.querySelector("details");
  if (detay) detay.open = true;
}

const paraBicimi = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TutarSatiri({ bilgi }: { bilgi: TutarBilgisi }) {
  if (bilgi.durum === "guncel_degil") {
    return <span className="mt-1 block text-base text-metin-ikincil">Güncel tutar kontrol ediliyor. Resmi kaynaktan teyit edin.</span>;
  }
  return (
    <span className="mt-1 block text-base">
      Genel bilgi olarak {bilgi.donem.slice(0, 4)} tutarı: <strong>{paraBicimi.format(bilgi.tutar)} TL</strong>{" "}
      <span className="text-metin-ikincil">(kaynak: {bilgi.kaynak})</span>
    </span>
  );
}

function KontrolEdiliyor() {
  return (
    <span className="inline-block rounded-full border border-cizgi bg-bilgi-acik px-2.5 py-0.5 text-base font-normal text-metin-ikincil">
      Kontrol ediliyor
      <span className="sr-only">: bu bilgi henüz hukuk uzmanı kontrolünden geçmedi</span>
    </span>
  );
}

export function AdimKarti({
  adim: a,
  belgeler,
  kurumlar,
  sozluk,
  yapildi,
  onYapildi,
}: {
  adim: HesaplanmisAdim;
  belgeler: Record<string, Belge>;
  sozluk: Terim[];
  /** Cevaplara göre gösterilen kurumlar; kartta bu adımla ilgili olanlara bağlantı verilir. */
  kurumlar: Kurum[];
  yapildi: boolean;
  onYapildi: (v: boolean) => void;
}) {
  const genelIpuclari = a.ipuclari.filter((i) => i.tur === "genel");
  const deneyimler = a.ipuclari.filter((i) => i.tur === "deneyim");
  const ilgiliKurumlar = kurumlar.filter((k) => a.kurum_turleri.includes(k.tur));

  return (
    <li
      id={`adim-${a.id}`}
      className={`scroll-mt-24 rounded-lg border bg-yuzey ${yapildi ? "border-vurgu/40" : "border-cizgi"}`}
    >
      <details className="group">
        <summary className="flex min-h-16 cursor-pointer list-none items-start gap-3 rounded-lg p-4 hover:bg-zemin">
          <span className="min-w-0 flex-1">
            <span className={`block text-lg font-semibold leading-snug ${yapildi ? "text-metin-ikincil line-through decoration-1" : ""}`}>
              {a.baslik}
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-2">
              {yapildi && (
                <span className="rounded-full bg-vurgu-acik px-2.5 py-0.5 text-base font-semibold text-vurgu-koyu">Yapıldı</span>
              )}
              {a.oncelik === "kritik" && !yapildi && (
                <span className="rounded-full bg-uyari-acik px-2.5 py-0.5 text-base text-uyari">Öncelikli</span>
              )}
              {KONTROL_ROZETLERI && !a.dogrulandi && <KontrolEdiliyor />}
            </span>
          </span>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-cizgi px-3 py-1 text-base text-vurgu-koyu">
            <span className="group-open:hidden">Aç</span>
            <span className="hidden group-open:inline">Kapat</span>
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">▾</span>
          </span>
        </summary>

        <div className="px-4 pb-4">
          <dl className="space-y-4">
            {a.belirsiz && (
              <div className="rounded-md bg-bilgi-acik px-3 py-2 text-base">
                <dt className="sr-only">Not</dt>
                <dd>Bu adımı, bir soruya &ldquo;Bilmiyorum&rdquo; dediğiniz için gösteriyoruz. Durumunuza göre geçerli olmayabilir.</dd>
              </div>
            )}
            <Alan etiket="Ne?">
              <TerimliMetin metin={a.ne} sozluk={sozluk} />
            </Alan>
            {a.neden && (
              <Alan etiket="Neden önemli?">
                <TerimliMetin metin={a.neden} sozluk={sozluk} />
              </Alan>
            )}
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
            {a.nereye && (
              <Alan etiket="Nereye?">
                <TerimliMetin metin={a.nereye} sozluk={sozluk} />
              </Alan>
            )}
            {a.belgeler.length > 0 && (
              <Alan etiket="Hangi belgeler?">
                <ul className="list-disc space-y-1 pl-5">
                  {a.belgeler.map((b) => (
                    <li key={b}>{belgeler[b]?.ad ?? b}</li>
                  ))}
                </ul>
              </Alan>
            )}
            {a.cevrimici && (
              <Alan etiket="Çevrimiçi yapılabilir mi?">
                <TerimliMetin metin={a.cevrimici} sozluk={sozluk} />
              </Alan>
            )}
            {ilgiliKurumlar.length > 0 && (
              <Alan etiket="İlgili kurumlar">
                <ul className="flex flex-wrap gap-2">
                  {ilgiliKurumlar.map((k) => (
                    <li key={k.id}>
                      <a
                        href={`#kurum-${k.id}`}
                        onClick={() => kurumaGit(k.id)}
                        className="inline-flex min-h-10 items-center rounded-full border border-cizgi bg-zemin px-3 text-base text-vurgu-koyu hover:border-vurgu"
                      >
                        {k.ad} <span aria-hidden="true">&nbsp;→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Alan>
            )}
            {genelIpuclari.length > 0 && (
              <Alan etiket="İpucu">
                <ul className="space-y-2">
                  {genelIpuclari.map((i) => (
                    <li key={i.metin}>
                      <TerimliMetin metin={i.metin} sozluk={sozluk} />
                    </li>
                  ))}
                </ul>
              </Alan>
            )}
            {deneyimler.length > 0 && (
              <Alan etiket="Kullanıcı deneyimi">
                <p className="mb-2 text-base text-metin-ikincil">Resmi bilgi değildir; başka kullanıcıların anlattıklarıdır.</p>
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
                <dd>
                  <TerimliMetin metin={a.uyari} sozluk={sozluk} />
                </dd>
              </div>
            )}
            {a.arac === "veraset_hesaplayici" && (
              <Alan etiket="Araç">
                <Link href="/hesaplayici/veraset-vergisi" className="inline-block py-2 text-vurgu-koyu underline underline-offset-4">
                  Veraset ve intikal vergisi hesaplayıcı
                </Link>
              </Alan>
            )}
            {a.sablonlar.length > 0 && (
              <Alan etiket="Dilekçe taslağı">
                <ul className="space-y-1">
                  {a.sablonlar.map((s) => (
                    <li key={s}>
                      <Link href={`/sablonlar/${s}`} className="inline-block py-2 text-vurgu-koyu underline underline-offset-4">
                        {SABLON_ADLARI[s] ?? "Dilekçe taslağı"}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Alan>
            )}
            {a.baglantilar.length > 0 && (
              <Alan etiket="Bağlantılar">
                <ul className="space-y-1">
                  {a.baglantilar.map((b) => (
                    <li key={b.url}>
                      <a href={b.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-vurgu-koyu underline underline-offset-4">
                        {b.ad}
                        <span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Alan>
            )}
          </dl>

          <details className="mt-5 text-base text-metin-ikincil">
            <summary className="cursor-pointer">Kaynaklar ve son kontrol</summary>
            <ul className="mt-2 space-y-1 break-words">
              {a.kaynak.map((k) => (
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
            <p className="mt-2">Son kontrol: {tarihMetni(a.son_kontrol)}</p>
          </details>
          <p className="mt-3 text-base text-metin-ikincil">
            Bu bilgide hata mı var?{" "}
            <a href={hataBildirBaglantisi(a.baslik)} className="inline-block py-2 text-vurgu-koyu underline underline-offset-4">
              Bize yazın
            </a>
          </p>
        </div>
      </details>
      <label className="flex min-h-14 cursor-pointer items-center gap-3 border-t border-cizgi px-4 py-2 text-lg">
        <input
          type="checkbox"
          checked={yapildi}
          onChange={(e) => onYapildi(e.target.checked)}
          className="size-7 shrink-0 cursor-pointer accent-vurgu"
        />
        <span>Bu adımı yaptım</span>
        <span className="sr-only">: {a.baslik}</span>
      </label>
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
