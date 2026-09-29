"use client";

import Link from "next/link";
import { aracGorunur } from "@/lib/araclar";
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
  hazir = new Set(),
  turetilmis = new Map(),
  onBelge,
}: {
  adim: HesaplanmisAdim;
  belgeler: Record<string, Belge>;
  kurumlar: Kurum[];
  sozluk: Terim[];
  bekledikleri?: HesaplanmisAdim[];
  yazdirma?: boolean;
  /** Hazır belgeler (işaretlenen + yapılan adımların ürettikleri). */
  hazir?: Set<string>;
  /** Yapılan bir adım sayesinde hazır sayılan belge → o adımın başlığı. */
  turetilmis?: Map<string, string>;
  onBelge?: (id: string, hazir: boolean) => void;
}) {
  const ac = usePanelAc();
  const genelIpuclari = a.ipuclari.filter((i) => i.tur === "genel");
  const deneyimler = a.ipuclari.filter((i) => i.tur === "deneyim");
  const ilgiliKurumlar = kurumlar.filter((k) => a.kurum_turleri.includes(k.tur));
  // e-Devlet bağlantıları "Çevrimiçi yapılabilir mi?" satırında düğme olarak gösterilir; diğerleri altta.
  const edevlet = a.baglantilar.filter((b) => b.url.includes("turkiye.gov.tr"));
  const digerBaglantilar = a.baglantilar.filter((b) => !b.url.includes("turkiye.gov.tr"));
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
      </dl>

      <YaninizaAlin
        adim={a}
        belgeler={belgeler}
        kurumlar={ilgiliKurumlar}
        hazir={hazir}
        turetilmis={turetilmis}
        onBelge={onBelge}
        yazdirma={yazdirma}
      />

      <dl className="space-y-5">
        {a.tutarBilgisi && (
          <Alan etiket="Tutar">
            <TutarSatiri bilgi={a.tutarBilgisi} />
          </Alan>
        )}
        {a.nereye && <Alan etiket="Nereye?">{metin(a.nereye)}</Alan>}
        {(a.cevrimici || (edevlet.length > 0 && !yazdirma)) && (
          <Alan etiket="Çevrimiçi yapılabilir mi?">
            {a.cevrimici && metin(a.cevrimici)}
            {!yazdirma && edevlet.length > 0 && (
              <span className="mt-2 flex flex-col gap-2">
                {edevlet.map((b) => (
                  <a
                    key={b.url}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border-2 border-vurgu-koyu px-4 py-2 font-semibold text-vurgu-koyu no-underline hover:bg-vurgu-acik"
                  >
                    {b.ad.replace(/^e-Devlet: /, "e-Devlet'te aç: ")}
                    <span className="sr-only"> (yeni sekmede açılır)</span>
                  </a>
                ))}
              </span>
            )}
          </Alan>
        )}
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

      {!yazdirma && (a.arac.includes("veraset_hesaplayici") || a.arac.includes("miras_payi") || a.arac.includes("olum_ayligi") || a.arac.includes("reddi_miras_tablosu") || digerBaglantilar.length > 0) && (
        <div className="space-y-2 border-t border-cizgi pt-4">
          {a.arac.includes("reddi_miras_tablosu") && aracGorunur("reddi_miras_tablosu") && (
            <p>
              <Link href="/reddi-miras" className="dugme dugme-birincil">
                Varlık ve borçları karşılaştırın
              </Link>
            </p>
          )}
          {a.arac.includes("olum_ayligi") && (
            <p>
              <Link href="/hesaplayici/olum-ayligi" className="baglanti">
                Ölüm aylığı hesaplayıcı: kime ne kadar bağlanır?
              </Link>
            </p>
          )}
          {a.arac.includes("miras_payi") && (
            <p>
              <Link href="/hesaplayici/miras-payi" className="baglanti">
                Miras payı hesaplayıcı: kime ne kadar kalır?
              </Link>
            </p>
          )}
          {a.arac.includes("veraset_hesaplayici") && (
            <p>
              <Link href="/hesaplayici/veraset-vergisi" className="baglanti">
                Veraset vergisi hesaplayıcı
              </Link>
            </p>
          )}
          {digerBaglantilar.map((b) => (
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

/**
 * "Yanınıza alın": adımın istediği belgeler, ilgili kurumların ek olarak istedikleri ve varsa dilekçe taslağı.
 * İşaretler belge listesiyle ortaktır; yapılan bir adımın ürettiği belge kendiliğinden hazır görünür.
 */
function YaninizaAlin({
  adim: a,
  belgeler,
  kurumlar,
  hazir,
  turetilmis,
  onBelge,
  yazdirma,
}: {
  adim: HesaplanmisAdim;
  belgeler: Record<string, Belge>;
  kurumlar: Kurum[];
  hazir: Set<string>;
  turetilmis: Map<string, string>;
  onBelge?: (id: string, hazir: boolean) => void;
  yazdirma: boolean;
}) {
  const kurumdan = new Map<string, string[]>();
  for (const k of kurumlar) {
    for (const b of k.islemler.flatMap((i) => i.belgeler)) {
      if (a.belgeler.includes(b)) continue;
      kurumdan.set(b, [...new Set([...(kurumdan.get(b) ?? []), k.ad])]);
    }
  }
  const satirlar = [...a.belgeler.map((id) => ({ id, kurumlar: [] as string[] })), ...[...kurumdan].map(([id, k]) => ({ id, kurumlar: k }))];
  const beyanname = a.arac.includes("beyanname_araci") && aracGorunur("beyanname_araci");
  if (satirlar.length === 0 && a.sablonlar.length === 0 && !beyanname) return null;

  return (
    <section aria-labelledby={`yanin-${a.id}`} className="rounded-2xl border border-altin/60 bg-altin-acik/70 p-4">
      <h3 id={`yanin-${a.id}`} className="font-bold text-vurgu-koyu">
        Yanınıza alın
      </h3>
      {satirlar.length > 0 && (
        <ul className="mt-2 space-y-1">
          {satirlar.map(({ id, kurumlar: k }) => {
            const b = belgeler[id];
            if (!b) return null;
            const kaynak = turetilmis.get(id);
            const secili = hazir.has(id);
            return (
              <li key={id}>
                {yazdirma ? (
                  <span>
                    {secili ? "☑" : "☐"} {b.ad}
                  </span>
                ) : (
                  <label className={`flex min-h-11 items-start gap-3 py-1.5 ${kaynak ? "" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      checked={secili}
                      disabled={!!kaynak || !onBelge}
                      onChange={(e) => onBelge?.(id, e.target.checked)}
                      className="mt-0.5 size-6 shrink-0 accent-vurgu"
                    />
                    <span>
                      <span className={secili ? "text-metin-ikincil line-through" : "font-bold"}>{b.ad}</span>
                      {kaynak && <span className="block text-base text-vurgu">Hazır: &ldquo;{kaynak}&rdquo; adımını yaptınız.</span>}
                      {!kaynak && k.length > 0 && <span className="block text-base text-metin-ikincil">Bazı kurumlar istiyor: {k.join(", ")}</span>}
                      {!secili && b.not && <span className="block text-base text-metin-ikincil">{b.not}</span>}
                    </span>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {!yazdirma && beyanname && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-yuzey px-4 py-3">
          <span>
            <span className="block font-bold">Beyanname formu</span>
            <span className="text-base text-metin-ikincil">Resmi formu adım adım doldurun, yazdırıp götürün</span>
          </span>
          <Link href="/beyanname" className="dugme dugme-birincil min-h-11 px-4 py-2 text-base">
            Formu doldur
          </Link>
        </div>
      )}
      {!yazdirma &&
        a.sablonlar.map((s) => (
          <div key={s} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-yuzey px-4 py-3">
            <span>
              <span className="block font-bold">Dilekçe</span>
              <span className="text-base text-metin-ikincil">{SABLON_ADLARI[s] ?? s}</span>
            </span>
            <Link href={`/sablonlar/${s}`} className="dugme dugme-birincil min-h-11 px-4 py-2 text-base">
              Taslağı doldur
            </Link>
          </div>
        ))}
    </section>
  );
}
