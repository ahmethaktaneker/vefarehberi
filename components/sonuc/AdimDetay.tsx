"use client";

import Link from "next/link";
import type { Belge, Kurum, Terim } from "@/lib/icerik/sema";
import type { HesaplanmisAdim, TutarBilgisi } from "@/lib/kurallar/liste";
import { tarihMetni } from "@/lib/kurallar/tarih";
import { hataBildirBaglantisi } from "@/lib/marka";
import { TerimliMetin } from "@/components/TerimliMetin";
import { usePanelAc } from "@/components/sonuc/Panel";

const SABLON_ADLARI: Record<string, string> = {
  banka_bakiye_yazisi: "Bankadan bakiye yazısı talebi",
  abonelik_iptal: "Abonelik iptali ve güvence bedeli iadesi talebi",
  otomatik_odeme_iptal: "Otomatik ödeme talimatlarının iptali talebi",
};

const paraBicimi = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TutarSatiri({ bilgi }: { bilgi: TutarBilgisi }) {
  if (bilgi.durum === "guncel_degil") {
    return <span className="block text-base text-metin-ikincil">Güncel tutar kontrol ediliyor. Resmi kaynaktan teyit edin.</span>;
  }
  return (
    <span className="block text-base">
      Genel bilgi olarak {bilgi.donem.slice(0, 4)} tutarı: <strong>{paraBicimi.format(bilgi.tutar)} TL</strong>{" "}
      <span className="text-metin-ikincil">(kaynak: {bilgi.kaynak})</span>
    </span>
  );
}

export function kalanMetni(kalan: number): string {
  if (kalan > 1) return `${kalan} gün kaldı`;
  if (kalan === 1) return "1 gün kaldı";
  return "Bugün son gün";
}

/** Son tarih kutusu: tarih, kalan gün ve ilgili notlar. */
export function SonTarihKutusu({ adim: a }: { adim: HesaplanmisAdim }) {
  const b = a.sonTarihBilgisi;
  const st = a.son_tarih;
  if (!b || !st) return null;
  return (
    <div className={`rounded-xl border-l-4 border-uyari p-4 ${b.gecti ? "bg-yuzey" : "bg-uyari-acik"}`}>
      <p className="text-lg">
        Son tarih: <strong>{tarihMetni(b.tarih)}</strong>
      </p>
      <p className="font-semibold text-uyari">{b.gecti ? "Süre geçmiş görünüyor" : kalanMetni(b.kalanGun)}</p>
      {b.gecti && <p className="mt-2">{st.gecti_notu}</p>}
      {st.not && <p className="mt-2 text-base text-metin-ikincil">{st.not}</p>}
      {b.belirsizNot && <p className="mt-2 text-base text-metin-ikincil">{b.belirsizNot}</p>}
    </div>
  );
}

/**
 * Bir adımın tüm ayrıntıları: panelde ve yazdırılan listede kullanılır.
 * Her adımda aynı yapı (Brief 13): Ne? / Neden önemli? / Nereye? / Hangi belgeler? / Çevrimiçi? / İpucu.
 */
export function AdimDetay({
  adim: a,
  belgeler,
  kurumlar,
  sozluk,
  bekledikleri = [],
  yazdirma = false,
}: {
  adim: HesaplanmisAdim;
  belgeler: Record<string, Belge>;
  kurumlar: Kurum[];
  sozluk: Terim[];
  bekledikleri?: HesaplanmisAdim[];
  yazdirma?: boolean;
}) {
  const ac = usePanelAc();
  const genelIpuclari = a.ipuclari.filter((i) => i.tur === "genel");
  const deneyimler = a.ipuclari.filter((i) => i.tur === "deneyim");
  const ilgiliKurumlar = kurumlar.filter((k) => a.kurum_turleri.includes(k.tur));
  const metin = (m: string) => (yazdirma ? m : <TerimliMetin metin={m} sozluk={sozluk} />);

  return (
    <div className="space-y-5">
      {bekledikleri.length > 0 && (
        <p className="rounded-xl bg-altin-acik px-4 py-3 text-base">
          Önce şunu yapmanız önerilir:{" "}
          {bekledikleri.map((b, i) => (
            <span key={b.id}>
              {i > 0 && ", "}
              {yazdirma ? (
                <strong>{b.baslik}</strong>
              ) : (
                <button type="button" onClick={() => ac({ tur: "adim", id: b.id })} className="baglanti font-bold">
                  {b.baslik}
                </button>
              )}
            </span>
          ))}
          . Genellikle bu adım için onun sonucu gerekir.
        </p>
      )}
      {a.belirsiz && (
        <p className="rounded-xl bg-bilgi-acik px-4 py-3 text-base">
          Bu adımı, bir soruya &ldquo;Bilmiyorum&rdquo; dediğiniz için gösteriyoruz. Durumunuza göre geçerli olmayabilir.
        </p>
      )}
      <SonTarihKutusu adim={a} />

      <dl className="space-y-5">
        <Alan etiket="Ne?">{metin(a.ne)}</Alan>
        {a.neden && <Alan etiket="Neden önemli?">{metin(a.neden)}</Alan>}
        {a.tutarBilgisi && (
          <Alan etiket="Tutar">
            <TutarSatiri bilgi={a.tutarBilgisi} />
          </Alan>
        )}
        {a.nereye && <Alan etiket="Nereye?">{metin(a.nereye)}</Alan>}
        {a.belgeler.length > 0 && (
          <Alan etiket="Hangi belgeler?">
            <ul className="list-disc space-y-1 pl-5 marker:text-altin-koyu">
              {a.belgeler.map((b) => (
                <li key={b}>{belgeler[b]?.ad ?? b}</li>
              ))}
            </ul>
          </Alan>
        )}
        {a.cevrimici && <Alan etiket="Çevrimiçi yapılabilir mi?">{metin(a.cevrimici)}</Alan>}
        {ilgiliKurumlar.length > 0 && !yazdirma && (
          <Alan etiket="İlgili kurumlar">
            <ul className="flex flex-wrap gap-2">
              {ilgiliKurumlar.map((k) => (
                <li key={k.id}>
                  <button
                    type="button"
                    onClick={() => ac({ tur: "kurum", id: k.id })}
                    className="inline-flex min-h-11 items-center rounded-full border border-cizgi bg-yuzey px-4 text-base text-vurgu hover:border-vurgu"
                  >
                    {k.ad}
                  </button>
                </li>
              ))}
            </ul>
          </Alan>
        )}
        {genelIpuclari.length > 0 && (
          <Alan etiket="İpucu">
            <ul className="space-y-2">
              {genelIpuclari.map((i) => (
                <li key={i.metin}>{metin(i.metin)}</li>
              ))}
            </ul>
          </Alan>
        )}
        {deneyimler.length > 0 && (
          <Alan etiket="Başka ailelerin deneyimi">
            <p className="mb-2 text-base text-metin-ikincil">Resmi bilgi değildir; kullanıcıların anlattıklarıdır.</p>
            <ul className="space-y-2">
              {deneyimler.map((i) => (
                <li key={i.metin} className="border-l-2 border-altin pl-3">
                  {i.metin}
                </li>
              ))}
            </ul>
          </Alan>
        )}
        {a.uyari && (
          <div className="rounded-xl border-l-4 border-vurgu bg-vurgu-acik px-4 py-3">
            <dt className="sr-only">Dikkat</dt>
            <dd>{metin(a.uyari)}</dd>
          </div>
        )}
      </dl>

      {!yazdirma && (a.arac || a.sablonlar.length > 0 || a.baglantilar.length > 0) && (
        <div className="space-y-2 border-t border-cizgi pt-4">
          {a.arac === "veraset_hesaplayici" && (
            <p>
              <Link href="/hesaplayici/veraset-vergisi" className="baglanti">
                Veraset vergisi hesaplayıcı
              </Link>
            </p>
          )}
          {a.sablonlar.map((s) => (
            <p key={s}>
              <Link href={`/sablonlar/${s}`} className="baglanti">
                Dilekçe taslağı: {SABLON_ADLARI[s] ?? s}
              </Link>
            </p>
          ))}
          {a.baglantilar.map((b) => (
            <p key={b.url}>
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="baglanti">
                {b.ad}
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </a>
            </p>
          ))}
        </div>
      )}

      {!yazdirma && (
        <details className="text-base text-metin-ikincil">
          <summary className="flex min-h-11 cursor-pointer items-center">Kaynaklar ve son kontrol</summary>
          <ul className="mt-1 space-y-1 break-words">
            {a.kaynak.map((k) => (
              <li key={k}>
                {k.startsWith("http") ? (
                  <a href={k} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 underline underline-offset-2">
                    {new URL(k).hostname.replace(/^www\./, "")}
                  </a>
                ) : (
                  k
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2">Son kontrol: {tarihMetni(a.son_kontrol)}</p>
          <p className="mt-2">
            Bu bilgide hata mı var?{" "}
            <a href={hataBildirBaglantisi(a.baslik)} className="baglanti">
              Bize yazın
            </a>
          </p>
        </details>
      )}
    </div>
  );
}

function Alan({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-bold text-vurgu-koyu">{etiket}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
