"use client";

import { useState } from "react";
import type { Belge, Yer, ZamanGrubu } from "@/lib/icerik/sema";
import { bekledikleri, type DonemOzeti, type YerOzeti } from "@/lib/kurallar/ilerleme";
import type { HesaplanmisAdim, Liste } from "@/lib/kurallar/liste";
import { tarihMetni } from "@/lib/kurallar/tarih";
import { kalanMetni, TutarSatiri } from "@/components/sonuc/AdimDetay";
import { usePanelAc } from "@/components/sonuc/Panel";

export const ZAMAN_ETIKETLERI: Record<ZamanGrubu, string> = {
  ilk_hafta: "İlk hafta",
  ilk_ay: "İlk ay",
  ilk_3_ay: "İlk 3 ay",
  ilk_4_ay: "İlk 4 ay",
  sonra: "Sonra, acelesi olmayanlar",
};

export const YER_ETIKETLERI: Record<Yer, { ad: string; aciklama: string }> = {
  ev: { ad: "Evden, internetten", aciklama: "e-Devlet, Web Tapu ve platformların kendi sayfaları. e-Devlet şifreniz yeterli." },
  noter_mahkeme: { ad: "Noter ve mahkeme", aciklama: "Mirasçılık belgesi, reddi miras ve araç devri." },
  banka: { ad: "Banka şubesi", aciklama: "Aynı gidişte birlikte halledebilirsiniz." },
  risk_merkezi: { ad: "Bankalar Birliği Risk Merkezi", aciklama: "Kredi ve borç risk raporu." },
  sgk: { ad: "SGK", aciklama: "Ödenek başvuruları." },
  isveren: { ad: "Vefat edenin işvereni", aciklama: "Kıdem tazminatı ve işçilik alacakları." },
  kurumlar: { ad: "Operatör ve fatura kurumları", aciklama: "Telefon, internet, elektrik, su, doğalgaz." },
  vergi_dairesi: { ad: "Vergi dairesi", aciklama: "Veraset beyannamesi ve ilişik kesme belgesi." },
  tapu: { ad: "Tapu müdürlüğü", aciklama: "Web Tapu'dan randevu alarak." },
  saglik: { ad: "Sağlık kurumu", aciklama: "Ölüm belgesi." },
  konsolosluk: { ad: "Türk konsolosluğu", aciklama: "Yurtdışındaki işlemler." },
  dikkat: { ad: "Dikkat", aciklama: "" },
};

export const YER_SIRASI: Yer[] = ["ev", "saglik", "konsolosluk", "noter_mahkeme", "banka", "risk_merkezi", "sgk", "isveren", "kurumlar", "vergi_dairesi", "tapu"];

/** Çizilerek beliren onay işareti. */
export function Tik({ ciz = false, className = "size-5" }: { ciz?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`tik ${ciz ? "tik-ciz" : ""} ${className}`}>
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Ilerleme({ biten, toplam }: { biten: number; toplam: number }) {
  const yuzde = toplam ? Math.round((biten / toplam) * 100) : 0;
  return (
    <div>
      <p className="flex items-baseline justify-between gap-3">
        <span>Listenizdeki adımlar</span>
        <strong className="tabular-nums">
          {biten} / {toplam}
        </strong>
      </p>
      <div
        role="progressbar"
        aria-label="Yapılan adımlar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={yuzde}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-bilgi-acik"
      >
        <div className="h-full rounded-full bg-vurgu transition-[width] duration-700" style={{ width: `${yuzde}%` }} />
      </div>
    </div>
  );
}

/** "Şimdi yapılacak": sayfanın açıldığı tek adım. */
export function OdakKarti({
  adim: a,
  sonYapilan,
  onYaptim,
}: {
  adim: HesaplanmisAdim | undefined;
  sonYapilan: string | null;
  onYaptim: (id: string) => void;
}) {
  const ac = usePanelAc();
  return (
    <section aria-labelledby="odak-baslik" className="bir-kez-yuksel rounded-2xl border-t-4 border-altin bg-yuzey p-5 shadow-yuksek sm:p-6">
      <p role="status" aria-live="polite" className="min-h-0 text-base">
        {sonYapilan && (
          <span className="mb-3 flex items-center gap-2 font-bold text-vurgu">
            <span className="flex size-7 items-center justify-center rounded-full bg-vurgu text-white">
              <Tik ciz className="size-4" />
            </span>
            &ldquo;{sonYapilan}&rdquo; yapıldı.
          </span>
        )}
      </p>
      {a ? (
        <>
          <p id="odak-baslik" className="font-bold text-altin-koyu">
            {sonYapilan ? "Sıradaki adımınız" : "Şimdi yapılacak"}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold leading-snug text-vurgu-koyu">{a.baslik}</h2>
          {a.sonTarihBilgisi && !a.sonTarihBilgisi.gecti && (
            <p className="mt-2 font-bold text-uyari">
              Son tarih {tarihMetni(a.sonTarihBilgisi.tarih)}, {kalanMetni(a.sonTarihBilgisi.kalanGun).toLocaleLowerCase("tr")}
            </p>
          )}
          <p className="mt-3">{a.ne}</p>
          <dl className="mt-4 grid gap-2 border-t border-cizgi pt-4 text-base sm:grid-cols-[auto_1fr] sm:gap-x-4">
            {a.nereye && (
              <>
                <dt className="text-metin-ikincil">Nereye</dt>
                <dd>{a.nereye}</dd>
              </>
            )}
            {a.belgeler.length > 0 && (
              <>
                <dt className="text-metin-ikincil">Belgeler</dt>
                <dd>{a.belgeler.length} belge gerekiyor, ayrıntılarda</dd>
              </>
            )}
          </dl>
          <div className="mt-5 grid grid-cols-1 gap-3 min-[360px]:grid-cols-[1.3fr_1fr]">
            <button type="button" onClick={() => onYaptim(a.id)} className="dugme dugme-birincil">
              <Tik className="size-5" />
              Yaptım
            </button>
            <button type="button" onClick={() => ac({ tur: "adim", id: a.id })} className="dugme dugme-ikincil">
              Ayrıntılar
            </button>
          </div>
          <a href="#yolculuk" className="baglanti mt-3 inline-flex min-h-11 items-center text-base">
            Başka bir adım seçmek istiyorum
          </a>
        </>
      ) : (
        <>
          <h2 id="odak-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu">
            Listenizdeki tüm adımları işaretlediniz
          </h2>
          <p className="mt-2">Aşağıdaki dosyanızdan belgelerinize ve kurumlara yine ulaşabilirsiniz.</p>
        </>
      )}
    </section>
  );
}

export function SonTarihKartlari({ adimlar, yapilanlar }: { adimlar: HesaplanmisAdim[]; yapilanlar: Set<string> }) {
  const ac = usePanelAc();
  const gosterilecek = adimlar.filter((a) => !yapilanlar.has(a.id));
  if (gosterilecek.length === 0) return null;
  return (
    <section aria-labelledby="tarihler-baslik">
      <h2 id="tarihler-baslik" className="mb-3 font-serif text-xl font-semibold text-vurgu-koyu">
        Yaklaşan son tarihler
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {gosterilecek.map((a) => {
          const b = a.sonTarihBilgisi!;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => ac({ tur: "adim", id: a.id })}
                className={`flex h-full w-full flex-col items-start gap-1 rounded-2xl border-t-4 border-uyari p-4 text-left shadow-kart transition-shadow hover:shadow-yuksek ${
                  b.gecti ? "bg-yuzey" : "bg-yuzey"
                }`}
              >
                <span className="font-serif text-4xl font-semibold leading-none text-uyari tabular-nums">
                  {b.gecti ? "Geçti" : b.kalanGun}
                  {!b.gecti && <span className="ml-1 font-sans text-base font-bold">gün</span>}
                </span>
                <span className="mt-1 font-bold leading-snug">{a.baslik}</span>
                <span className="text-base text-metin-ikincil">{tarihMetni(b.tarih)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Beş dönem bir yol üzerinde; yalnızca şu anki dönem açık gelir. */
export function Yolculuk({
  donemler,
  simdiki,
  liste,
  yapilanlar,
  onIsaret,
}: {
  donemler: DonemOzeti[];
  simdiki: ZamanGrubu | null;
  liste: Liste;
  yapilanlar: Set<string>;
  onIsaret: (id: string, v: boolean) => void;
}) {
  const ac = usePanelAc();
  return (
    <section id="yolculuk" aria-labelledby="yolculuk-baslik" className="scroll-mt-6">
      <h2 id="yolculuk-baslik" className="font-serif text-xl font-semibold text-vurgu-koyu">
        Yolculuğunuz
      </h2>
      <p className="mt-1 text-base text-metin-ikincil">Bir adıma dokunarak ayrıntılarını görün, yuvarlağa dokunarak işaretleyin.</p>
      <ol className="relative mt-4 space-y-3 before:absolute before:top-7 before:bottom-7 before:left-[1.45rem] before:border-l-2 before:border-dashed before:border-altin">
        {donemler.map((d) => {
          const bitti = d.biten === d.adimlar.length;
          const simdi = d.grup === simdiki;
          return (
            <li key={d.grup} className="relative">
              <details open={simdi} className="group rounded-2xl border border-cizgi bg-yuzey shadow-kart open:shadow-yuksek">
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl px-3.5 py-3 marker:hidden">
                  <span
                    aria-hidden="true"
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      bitti ? "border-vurgu bg-vurgu text-white" : simdi ? "border-vurgu bg-vurgu ring-4 ring-altin-acik" : "border-cizgi bg-yuzey"
                    }`}
                  >
                    {bitti && <Tik className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-lg font-semibold">{ZAMAN_ETIKETLERI[d.grup]}</span>
                      {simdi && <span className="rounded-full bg-altin px-2.5 py-0.5 text-base font-bold text-vurgu-koyu">Şu an</span>}
                    </span>
                    <span className="block text-base text-metin-ikincil">
                      {bitti ? "Tamamlandı" : `${d.biten} / ${d.adimlar.length} yapıldı`}
                      {d.sonTarihVar && <span className="font-bold text-uyari">, son tarih var</span>}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-xl text-metin-ikincil transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <ul className="border-t border-cizgi">
                  {d.adimlar.map((a) => (
                    <AdimSatiri
                      key={a.id}
                      adim={a}
                      yapildi={yapilanlar.has(a.id)}
                      bekliyor={bekledikleri(a, liste, yapilanlar)}
                      onIsaret={onIsaret}
                      onAc={() => ac({ tur: "adim", id: a.id })}
                    />
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function AdimSatiri({
  adim: a,
  yapildi,
  bekliyor,
  onIsaret,
  onAc,
}: {
  adim: HesaplanmisAdim;
  yapildi: boolean;
  bekliyor: HesaplanmisAdim[];
  onIsaret: (id: string, v: boolean) => void;
  onAc: () => void;
}) {
  const [yeni, setYeni] = useState(false);
  return (
    <li className="flex items-center gap-2 border-b border-cizgi px-2 last:border-b-0">
      <button
        type="button"
        onClick={() => {
          setYeni(!yapildi);
          onIsaret(a.id, !yapildi);
        }}
        aria-pressed={yapildi}
        aria-label={`${a.baslik}: ${yapildi ? "yapıldı, işareti kaldır" : "yaptım olarak işaretle"}`}
        className="flex size-12 shrink-0 items-center justify-center rounded-full"
      >
        <span
          className={`flex size-7 items-center justify-center rounded-full border-2 transition-colors ${
            yapildi ? "border-vurgu bg-vurgu text-white" : "border-vurgu bg-yuzey text-transparent"
          }`}
        >
          <Tik ciz={yeni && yapildi} className="size-4" />
        </span>
      </button>
      <button type="button" onClick={onAc} className="flex min-h-14 min-w-0 flex-1 items-center gap-2 py-2 text-left">
        <span className="min-w-0 flex-1">
          <span className={`block leading-snug ${yapildi ? "text-metin-ikincil line-through" : "font-bold"}`}>{a.baslik}</span>
          {!yapildi && (bekliyor.length > 0 || a.sonTarihBilgisi || a.kategori === "odeme") && (
            <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-base">
              {a.sonTarihBilgisi && !a.sonTarihBilgisi.gecti && <span className="font-bold text-uyari">{a.sonTarihBilgisi.kalanGun} gün kaldı</span>}
              {a.sonTarihBilgisi?.gecti && <span className="font-bold text-uyari">Süre geçmiş görünüyor</span>}
              {a.kategori === "odeme" && <span className="text-vurgu">Size çıkabilecek ödeme</span>}
              {bekliyor.length > 0 && <span className="text-altin-koyu">Önce: {bekliyor[0].baslik.replace(/ alın$/, "").toLocaleLowerCase("tr")}</span>}
            </span>
          )}
        </span>
        <span aria-hidden="true" className="px-1 text-xl text-metin-ikincil">
          ›
        </span>
      </button>
    </li>
  );
}

export type DosyaOzeti = { odeme: number; risk: number; belgeHazir: number; belgeToplam: number; kurum: number; yer: number };

function Sayi({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 font-serif text-3xl font-semibold leading-none text-vurgu tabular-nums">{children}</span>;
}

export function Dosyaniz({ ozet }: { ozet: DosyaOzeti }) {
  const ac = usePanelAc();
  const kutucuk = "flex min-h-28 flex-col items-start rounded-2xl border border-cizgi bg-yuzey p-4 text-left shadow-kart transition-shadow hover:shadow-yuksek";
  return (
    <section aria-labelledby="dosya-baslik">
      <h2 id="dosya-baslik" className="font-serif text-xl font-semibold text-vurgu-koyu">
        Dosyanız
      </h2>
      <p className="mt-1 text-base text-metin-ikincil">Listenizle ilgili her şey tek yerde.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button type="button" className={kutucuk} onClick={() => ac({ tur: "odemeler" })}>
          <span className="font-bold">Ödemeler</span>
          <Sayi>{ozet.odeme}</Sayi>
          <span className="mt-auto pt-1 text-base text-metin-ikincil">{ozet.odeme ? "başvurulacak" : "hepsi tamam"}</span>
        </button>
        <button type="button" className={kutucuk} onClick={() => ac({ tur: "riskler" })}>
          <span className="font-bold">Borç ve risk</span>
          <Sayi>{ozet.risk}</Sayi>
          <span className="mt-auto pt-1 text-base text-metin-ikincil">{ozet.risk ? "kontrol edilecek" : "hepsi tamam"}</span>
        </button>
        <button type="button" className={kutucuk} onClick={() => ac({ tur: "belgeler" })}>
          <span className="font-bold">Belgeler</span>
          <Sayi>
            {ozet.belgeHazir}
            <span className="text-xl text-metin-ikincil"> / {ozet.belgeToplam}</span>
          </Sayi>
          <span className="mt-auto pt-1 text-base text-metin-ikincil">hazır</span>
        </button>
        {ozet.kurum > 0 && (
          <button type="button" className={kutucuk} onClick={() => ac({ tur: "kurum" })}>
            <span className="font-bold">Kurumlar</span>
            <Sayi>{ozet.kurum}</Sayi>
            <span className="mt-auto pt-1 text-base text-metin-ikincil">banka, operatör, fatura</span>
          </button>
        )}
        <button type="button" className={kutucuk} onClick={() => ac({ tur: "nereye" })}>
          <span className="font-bold">Nereye gideceğim</span>
          <Sayi>{ozet.yer}</Sayi>
          <span className="mt-auto pt-1 text-base text-metin-ikincil">{ozet.yer ? "yerde işiniz var" : "hepsi tamam"}</span>
        </button>
        <button type="button" className={`${kutucuk} ${ozet.kurum > 0 ? "" : "col-span-2 sm:col-span-1"}`} onClick={() => ac({ tur: "paylas" })}>
          <span className="font-bold">Paylaş ve hatırla</span>
          <span className="mt-auto pt-1 text-base text-metin-ikincil">Aileyle paylaşın, takvime ekleyin, yazdırın</span>
        </button>
      </div>
    </section>
  );
}

/** Ödeme veya risk adımlarının kısa listesi (panel içinde). */
export function KisaListe({ adimlar, bos }: { adimlar: HesaplanmisAdim[]; bos: string }) {
  const ac = usePanelAc();
  if (adimlar.length === 0) return <p>{bos}</p>;
  return (
    <ul className="divide-y divide-cizgi overflow-hidden rounded-2xl border border-cizgi bg-yuzey">
      {adimlar.map((a) => (
        <li key={a.id}>
          <button type="button" onClick={() => ac({ tur: "adim", id: a.id })} className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-zemin">
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{a.baslik}</span>
              {a.tutarBilgisi && <TutarSatiri bilgi={a.tutarBilgisi} />}
              {a.belirsiz && <span className="block text-base text-metin-ikincil">Durumunuza göre geçerli olabilir.</span>}
            </span>
            <span aria-hidden="true" className="text-xl text-metin-ikincil">
              ›
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** "Nereye gideceğim": yerlere göre işler ve yanınıza alacaklarınız. */
export function NereyeGit({ yerler, yapilanlar }: { yerler: YerOzeti[]; yapilanlar: Set<string> }) {
  const ac = usePanelAc();
  return (
    <div className="space-y-6">
      <p className="text-base text-metin-ikincil">
        İşleri gideceğiniz yere göre grupladık. Aynı yerdeki işleri tek gidişte halledebilir, yanınıza alacaklarınızı önceden hazırlayabilirsiniz.
      </p>
      {yerler.map((y) => {
        const kalan = y.adimlar.filter((a) => !yapilanlar.has(a.id)).length;
        return (
          <section key={y.yer} aria-labelledby={`yer-${y.yer}`} className="overflow-hidden rounded-2xl border border-cizgi bg-yuzey">
            <div className="px-4 pt-4">
              <h3 id={`yer-${y.yer}`} className="font-serif text-lg font-semibold text-vurgu-koyu">
                {YER_ETIKETLERI[y.yer].ad}
              </h3>
              <p className="text-base text-metin-ikincil">
                {kalan === 0 ? "Buradaki işler tamamlandı." : `${kalan} iş. ${YER_ETIKETLERI[y.yer].aciklama}`}
              </p>
            </div>
            <ul className="mt-2">
              {y.adimlar.map((a) => (
                <li key={a.id} className="border-t border-cizgi">
                  <button type="button" onClick={() => ac({ tur: "adim", id: a.id })} className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-zemin">
                    <span className={`flex-1 ${yapilanlar.has(a.id) ? "text-metin-ikincil line-through" : ""}`}>{a.baslik}</span>
                    <span aria-hidden="true" className="text-xl text-metin-ikincil">
                      ›
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {y.belgeler.length > 0 && kalan > 0 && (
              <div className="border-t border-cizgi bg-altin-acik px-4 py-3 text-base">
                <strong>Yanınıza alın:</strong> {y.belgeler.map((b: Belge) => b.ad).join(", ")}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
