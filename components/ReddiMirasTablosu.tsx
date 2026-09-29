"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { veriyiTamamla } from "@/lib/beyanname/hesap";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import { tutarOku } from "@/lib/hesaplayici";
import { istanbulBugun, tarihMetni } from "@/lib/kurallar/tarih";
import { bosTablo, redSuresi, tabloBaslat, tabloOzeti, yeniKalem, type ReddiMirasVerisi, type TabloKalemi } from "@/lib/reddiMiras";
import type { Cevaplar } from "@/lib/sorular";
import { icsOlustur } from "@/lib/takvim";

const kutu = "min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg";
const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tl = (n: number) => `${para.format(n)} TL`;

const KONTROLLER = [
  { id: "risk", metin: "Kredi ve kredi kartı borçları için risk raporu alındı" },
  { id: "varis", metin: "e-Devlet Vâris Hizmetleri'nden hesaplar ve kayıtlar sorgulandı" },
  { id: "vergi", metin: "Vergi dairesine ödenmemiş vergi borcu soruldu" },
  { id: "kefalet", metin: "Başkasının borcuna kefil olup olmadığı bankalara soruldu" },
  { id: "icra", metin: "Hakkında icra takibi ya da dava olup olmadığı e-Devlet'ten araştırıldı", url: "https://www.turkiye.gov.tr/adalet-murise-ait-icra-dosyasi-sorgulama" },
];

/** Reddi miras son gününü .ics olarak indirir; 7 gün ve 1 gün önce hatırlatır. Tarayıcıda üretilir. */
function takvimeEkle(sonGun: string) {
  const ics = icsOlustur([
    {
      id: "reddi-miras",
      baslik: "Mirası reddetmek için son gün",
      tarih: sonGun,
      aciklama: "Ret beyanı sulh hukuk mahkemesine yapılır (TMK m.605, 606, 609).",
    },
  ]);
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "reddi-miras-son-gun.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function yazdir() {
  window.print();
}

export function ReddiMirasTablosu({ redAy }: { redAy: number }) {
  const ham = useDepo(ANAHTARLAR.reddiMiras);
  const hamBeyanname = useDepo(ANAHTARLAR.beyanname);
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const cevaplar = useMemo(() => jsonCoz<Cevaplar>(hamCevaplar, {}), [hamCevaplar]);
  const t = useMemo(() => (ham ? { ...bosTablo(), ...jsonCoz<Partial<ReddiMirasVerisi>>(ham, {}) } : null), [ham]);

  useEffect(() => {
    if (ham === null && hamBeyanname !== undefined && hamCevaplar !== undefined) {
      const beyanname = hamBeyanname ? veriyiTamamla(jsonCoz<unknown>(hamBeyanname, {})) : null;
      const varliklar = Array.isArray(cevaplar.varliklar) ? cevaplar.varliklar : [];
      yaz(ANAHTARLAR.reddiMiras, JSON.stringify(tabloBaslat(beyanname, varliklar)));
    }
  }, [ham, hamBeyanname, hamCevaplar, cevaplar]);

  if (!t) return <p className="text-base text-metin-ikincil">Yükleniyor…</p>;
  const guncelle = (f: (d: ReddiMirasVerisi) => void) => {
    const kopya = structuredClone(t);
    f(kopya);
    yaz(ANAHTARLAR.reddiMiras, JSON.stringify(kopya));
  };
  const ozet = tabloOzeti(t);
  const vefat = typeof cevaplar.vefat_tarihi === "string" ? cevaplar.vefat_tarihi : "";
  const baslangic = t.ogrenme && t.ogrenme >= vefat ? t.ogrenme : vefat;
  const sure = redSuresi(baslangic, istanbulBugun(), redAy);
  const enBuyuk = Math.max(ozet.varlik, ozet.borc, 1);

  return (
    <>
      <div className="ekran-icerik space-y-8">
        <div className={`rounded-2xl p-5 ${sure && sure.kalanGun <= 30 ? "bg-uyari-acik" : "bg-vurgu-acik"}`}>
          {sure ? (
            <>
              <p className="font-serif text-2xl font-semibold text-vurgu-koyu">
                {sure.kalanGun >= 0 ? `${sure.kalanGun} gün kaldı` : "Süre geçmiş görünüyor"}
              </p>
              <p className="mt-1">
                Mirası reddetmek için son gün: <strong>{tarihMetni(sure.sonGun)}</strong>. Süre, ölümü öğrendiğiniz tarihten
                itibaren 3 aydır.
              </p>
            </>
          ) : (
            <p className="text-lg">Ölümü öğrendiğiniz tarihi girin; mirası reddetmek için kalan süreyi hesaplayalım.</p>
          )}
          <label className="mt-3 block max-w-xs">
            <span className="block text-base font-semibold">Ölümü öğrendiğiniz tarih</span>
            <input
              type="date"
              value={t.ogrenme || vefat}
              min={vefat || undefined}
              max={istanbulBugun()}
              onChange={(e) => guncelle((d) => void (d.ogrenme = e.target.value))}
              className={`${kutu} mt-1`}
            />
          </label>
          {sure && sure.kalanGun < 0 && (
            <p className="mt-2">
              Borçlar varlıklardan açıkça fazlaysa, süre geçmiş olsa da aşağıdaki &ldquo;borca batık miras&rdquo; yolu olabilir.
            </p>
          )}
          {sure && sure.kalanGun >= 0 && (
            <>
              <button type="button" onClick={() => takvimeEkle(sure.sonGun)} className="dugme dugme-ikincil mt-4 min-h-11 px-4 py-2 text-base">
                Son günü takvime ekle
              </button>
              <p className="mt-2 text-sm text-metin-ikincil">Telefonunuzun takvimi 7 gün ve 1 gün önce hatırlatır.</p>
            </>
          )}
          <p className="mt-2 text-sm text-metin-ikincil">Özel durumlar varsa bir avukata danışın.</p>
        </div>

        <Liste
          baslik="Bildiğiniz varlıklar"
          aciklama="Ev, arsa, araç, banka hesabı gibi. Değerini bilmiyorsanız yaklaşık yazın; taşınmazlarda piyasa değerini yazabilirsiniz."
          kalemler={t.varliklar}
          ekle="Varlık ekle"
          onEkle={() => guncelle((d) => void d.varliklar.push(yeniKalem()))}
          onDegis={(i, k) => guncelle((d) => void (d.varliklar[i] = k))}
          onSil={(i) => guncelle((d) => void d.varliklar.splice(i, 1))}
        />

        <Liste
          baslik="Bildiğiniz borçlar"
          aciklama="Kredi, kredi kartı, vergi borcu, kefalet gibi. Vefat tarihindeki kalan tutarı yazın."
          kalemler={t.borclar}
          ekle="Borç ekle"
          onEkle={() => guncelle((d) => void d.borclar.push(yeniKalem()))}
          onDegis={(i, k) => guncelle((d) => void (d.borclar[i] = k))}
          onSil={(i) => guncelle((d) => void d.borclar.splice(i, 1))}
        />

        <section aria-labelledby="karsilastirma" className="space-y-4 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6">
          <h2 id="karsilastirma" className="font-serif text-2xl font-semibold text-vurgu-koyu">
            Karşılaştırma
          </h2>
          <Cubuk ad="Varlıklar" tutar={ozet.varlik} oran={ozet.varlik / enBuyuk} renk="bg-vurgu" />
          <Cubuk ad="Borçlar" tutar={ozet.borc} oran={ozet.borc / enBuyuk} renk="bg-uyari" />
          <p className="text-lg">
            {ozet.varlik === 0 && ozet.borc === 0
              ? "Tutarları yazdıkça karşılaştırma burada görünür."
              : ozet.fark >= 0
                ? `Bildiğiniz varlıklar, bildiğiniz borçlardan ${tl(ozet.fark)} fazla.`
                : `Bildiğiniz borçlar, bildiğiniz varlıklardan ${tl(-ozet.fark)} fazla.`}
          </p>
          {ozet.eksik > 0 && <p className="text-base text-metin-ikincil">{ozet.eksik} kalemin tutarı boş; toplama eklenmedi.</p>}
          {ozet.borc > 0 && ozet.fark < 0 && (!sure || sure.kalanGun >= 0) && (
            <div className="rounded-xl border-l-4 border-uyari bg-uyari-acik p-4">
              <p className="font-semibold">Bildiğiniz borçlar, bildiğiniz varlıklardan fazla görünüyor.</p>
              <p className="mt-1 text-base">
                Bu tablo yalnızca yazdıklarınızı toplar, karar vermez. Bu durumdaki aileler genellikle mirası reddetmeyi, borçlar
                belirsizse resmi defter tutulmasını ya da borca batık miras tespitini değerlendirir (aşağıda anlatıldı). Ret her
                mirasçı için ayrı yapılır ve payın sizin çocuklarınıza geçmesine yol açabilir.
              </p>
              <p className="mt-2 text-base">İsterseniz ret beyanı dilekçesini burada birkaç dakikada hazırlayabilirsiniz.</p>
              <Link href="/sablonlar/mirasin_reddi" className="dugme dugme-birincil mt-3 min-h-11 px-5 py-2 text-base">
                Ret beyanı dilekçesini hazırla
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="bilinmeyen" className="space-y-3">
          <h2 id="bilinmeyen" className="font-serif text-2xl font-semibold text-vurgu-koyu">
            Bilmediğiniz borç kalmasın
          </h2>
          <ul className="space-y-2">
            {KONTROLLER.map((k) => {
              const secili = t.kontroller.includes(k.id);
              return (
                <li key={k.id}>
                  <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-cizgi bg-yuzey px-4 py-3">
                    <input
                      type="checkbox"
                      checked={secili}
                      onChange={() =>
                        guncelle((d) => {
                          d.kontroller = secili ? d.kontroller.filter((x) => x !== k.id) : [...d.kontroller, k.id];
                        })
                      }
                      className="mt-1 size-6 shrink-0 accent-vurgu-koyu"
                    />
                    <span>
                      <span className={secili ? "text-metin-ikincil line-through" : ""}>{k.metin}</span>
                      {"url" in k && k.url && (
                        <a href={k.url} target="_blank" rel="noopener noreferrer" className="baglanti mt-1 inline-flex min-h-11 items-center text-base">
                          e-Devlet&apos;te aç<span className="sr-only"> (yeni sekmede açılır)</span>
                        </a>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="secenekler" className="space-y-4">
          <h2 id="secenekler" className="font-serif text-2xl font-semibold text-vurgu-koyu">
            Seçenekler
          </h2>
          <Secenek baslik="Mirası reddetmek">
            Sulh hukuk mahkemesine sözlü ya da yazılı başvurularak yapılır. Reddeden, miras kalan mallardan da borçlardan da pay
            almaz (TMK m.605, 606, 609). <Link href="/sablonlar/mirasin_reddi" className="baglanti">Ret beyanı dilekçesini doldurun</Link>
            {" · "}
            <Link href="/rehber/reddi-miras-suresi" className="baglanti">Reddi miras rehberi</Link>
          </Secenek>
          <Secenek baslik="Resmi defter tutulmasını istemek">
            Borçların ne kadar olduğundan emin değilseniz, sulh hukuk mahkemesinden terekenin resmi defterinin tutulmasını
            isteyebilirsiniz. Bu istek 1 ay içinde yapılır; mahkeme varlık ve borçları tespit eder (TMK m.619, 620).
          </Secenek>
          <Secenek baslik="Borca batık miras (hükmen red)">
            Vefat tarihinde vefat edenin borç ödeyemeyecek durumda olduğu açıkça belliyse ya da resmen tespit edilmişse, miras
            reddedilmiş sayılır; ayrıca ret beyanı vermek gerekmez (TMK m.605/2). Bu, 3 aylık süreye bağlı değildir. Alacaklılar
            itiraz edebildiği için durum çoğu zaman mahkemede tespit ettirilir. Bu arada terekeye karışmamak (mal satmamak,
            hesaptan para çekmemek) önemlidir.
          </Secenek>
          <Secenek baslik="Reddedenin payı kime geçer?">
            Mirası reddeden kişinin payı, o kişi hiç yokmuş gibi sıradaki hak sahiplerine geçer (TMK m.611). Örneğin bir çocuk
            reddederse payı onun çocuklarına geçebilir; borç nedeniyle reddediliyorsa onların da ayrıca reddetmesi gerekebilir.
            Çocukların hepsi reddederse payları eşe geçer (m.613). En yakın mirasçıların hepsi reddederse miras mahkemece tasfiye
            edilir (m.612).
          </Secenek>
          <p className="rounded-xl border-l-4 border-vurgu bg-vurgu-acik px-4 py-3">
            Karar vermeden önce vefat edenin mallarını satmayın, hesabından para çekmeyin. Süre içinde terekeye karışan kişi mirası
            reddedemez (TMK m.610).
          </p>
        </section>

        <div className="space-y-2">
          <button type="button" onClick={yazdir} className="dugme dugme-birincil">
            Avukat için özeti yazdır
          </button>
          <p className="text-sm text-metin-ikincil">
            Bu tablo karar vermez; bir avukatla konuşurken elinizde olsun diye hazırlanır. Bilgileriniz yalnızca bu cihazda kalır.
          </p>
        </div>
      </div>

      <div className="form-yazdirma">
        <Ozet t={t} ozet={ozet} sure={sure} />
      </div>
    </>
  );
}

function Liste({
  baslik,
  aciklama,
  kalemler,
  ekle,
  onEkle,
  onDegis,
  onSil,
}: {
  baslik: string;
  aciklama: string;
  kalemler: TabloKalemi[];
  ekle: string;
  onEkle: () => void;
  onDegis: (i: number, k: TabloKalemi) => void;
  onSil: (i: number) => void;
}) {
  return (
    <section className="space-y-3 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6">
      <h2 className="font-serif text-2xl font-semibold text-vurgu-koyu">{baslik}</h2>
      <p className="text-base text-metin-ikincil">{aciklama}</p>
      {kalemler.map((k, i) => {
        const n = tutarOku(k.tutar);
        return (
          <div key={k.id} className="grid gap-2 rounded-xl border border-cizgi p-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
            <label className="block">
              <span className="block text-base font-semibold">Ne?</span>
              <input value={k.ad} onChange={(e) => onDegis(i, { ...k, ad: e.target.value })} className={`${kutu} mt-1`} />
            </label>
            <label className="block">
              <span className="block text-base font-semibold">Tutar (TL)</span>
              <input
                inputMode="decimal"
                value={k.tutar}
                placeholder="Örn. 250.000"
                onChange={(e) => onDegis(i, { ...k, tutar: e.target.value })}
                aria-invalid={k.tutar !== "" && n === null ? true : undefined}
                className={`${kutu} mt-1`}
              />
            </label>
            <button type="button" onClick={() => onSil(i)} className="min-h-12 px-2 text-base text-uyari underline underline-offset-4">
              Sil<span className="sr-only">: {k.ad}</span>
            </button>
          </div>
        );
      })}
      <button type="button" onClick={onEkle} className="dugme dugme-ikincil">
        + {ekle}
      </button>
    </section>
  );
}

function Cubuk({ ad, tutar, oran, renk }: { ad: string; tutar: number; oran: number; renk: string }) {
  return (
    <div>
      <div className="flex justify-between gap-3">
        <span>{ad}</span>
        <span className="font-semibold">{tl(tutar)}</span>
      </div>
      <div className="mt-1 h-4 overflow-hidden rounded-full bg-bilgi-acik" aria-hidden="true">
        <div className={`h-full rounded-full ${renk}`} style={{ width: `${Math.max(0, Math.min(1, oran)) * 100}%` }} />
      </div>
    </div>
  );
}

function Secenek({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cizgi bg-yuzey p-4">
      <h3 className="font-semibold">{baslik}</h3>
      <p className="mt-1 text-base">{children}</p>
    </div>
  );
}

function Ozet({ t, ozet, sure }: { t: ReddiMirasVerisi; ozet: ReturnType<typeof tabloOzeti>; sure: ReturnType<typeof redSuresi> }) {
  const satir = (k: TabloKalemi) => (
    <tr key={k.id}>
      <td className="border border-black px-2 py-1">{k.ad || "—"}</td>
      <td className="border border-black px-2 py-1 text-right">{tutarOku(k.tutar) === null ? "—" : tl(tutarOku(k.tutar)!)}</td>
    </tr>
  );
  return (
    <div className="space-y-4 bg-white text-[11pt] text-black">
      <p className="text-[15pt] font-bold">Miras: varlık ve borç özeti</p>
      {sure && <p>Reddi miras için son gün: {tarihMetni(sure.sonGun)}</p>}
      <table className="w-full border-collapse">
        <caption className="text-left font-bold">Varlıklar</caption>
        <tbody>
          {t.varliklar.map(satir)}
          <tr>
            <td className="border border-black px-2 py-1 font-bold">Toplam</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{tl(ozet.varlik)}</td>
          </tr>
        </tbody>
      </table>
      <table className="w-full border-collapse">
        <caption className="text-left font-bold">Borçlar</caption>
        <tbody>
          {t.borclar.map(satir)}
          <tr>
            <td className="border border-black px-2 py-1 font-bold">Toplam</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{tl(ozet.borc)}</td>
          </tr>
        </tbody>
      </table>
      <p className="font-bold">Fark: {ozet.fark >= 0 ? "" : "−"}{tl(Math.abs(ozet.fark))}</p>
      <div>
        <p className="font-bold">Yapılan kontroller</p>
        <ul>
          {KONTROLLER.map((k) => (
            <li key={k.id}>
              {t.kontroller.includes(k.id) ? "☑" : "☐"} {k.metin}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[9pt]">Vefat Rehberi ile hazırlandı.</p>
    </div>
  );
}
