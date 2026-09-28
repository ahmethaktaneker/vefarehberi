"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import {
  YAKINLIK_ETIKETLERI,
  beyannameOzeti,
  bosVeri,
  ekListesi,
  hisseOku,
  yeniKimlik,
  type BeyannameVerisi,
  type Yakinlik,
} from "@/lib/beyanname/hesap";
import type { BeyannameIcerik } from "@/lib/beyanname/sema";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import { tutarOku } from "@/lib/hesaplayici";
import type { Parametreler } from "@/lib/icerik/sema";
import type { Cevaplar } from "@/lib/sorular";
import { BeyannameDosyasi, tl } from "./BeyannameDosyasi";

const kutu = "min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg";

const ADIMLAR = [
  { id: "muris", ad: "Vefat eden" },
  { id: "mirascilar", ad: "Mirasçılar" },
  { id: "tasinmaz", ad: "Taşınmazlar" },
  { id: "haklar", ad: "Haklar" },
  { id: "diger", ad: "Diğer varlıklar" },
  { id: "borclar", ad: "Borç ve masraflar" },
  { id: "ekler", ad: "Eklenecek belgeler" },
  { id: "ozet", ad: "Özet ve çıktı" },
] as const;

/** İlk açılışta, listedeki cevaplardan başlangıç verisi: varlık türleri boş satır olarak gelir. */
function cevaplardanBaslat(c: Cevaplar): BeyannameVerisi {
  const v = bosVeri();
  v.muris.vefat_tarihi = typeof c.vefat_tarihi === "string" ? c.vefat_tarihi : "";
  const varliklar = Array.isArray(c.varliklar) ? c.varliklar : [];
  const kalem = (tur: string) => ({ id: yeniKimlik(), tur, aciklama: "", deger: "" });
  if (varliklar.includes("ev_arsa")) v.tasinmazlar.push({ id: yeniKimlik(), tur: "konut", konum: "", hisse: "", deger: "" });
  if (varliklar.includes("baska_sehir_tasinmaz")) v.tasinmazlar.push({ id: yeniKimlik(), tur: "konut", konum: "", hisse: "", deger: "" });
  if (varliklar.includes("banka")) v.digerleri.push(kalem("banka"));
  if (varliklar.includes("arac")) v.digerleri.push(kalem("arac"));
  if (varliklar.includes("sirket")) v.digerleri.push(kalem("ticari"));
  if (varliklar.includes("kredi")) v.borclar.push({ id: yeniKimlik(), tur: "belgeli_borc", aciklama: "", tutar: "" });
  if (varliklar.includes("kredi_karti")) v.borclar.push({ id: yeniKimlik(), tur: "belgeli_borc", aciklama: "", tutar: "" });
  return v;
}

export function BeyannameAraci({ icerik, parametreler }: { icerik: BeyannameIcerik; parametreler: Parametreler }) {
  const ham = useDepo(ANAHTARLAR.beyanname);
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const [adim, setAdim] = useState(0);
  const baslik = useRef<HTMLHeadingElement>(null);
  const ilkCizim = useRef(true);

  const kayitli = useMemo(() => jsonCoz<BeyannameVerisi | null>(ham, null), [ham]);
  useEffect(() => {
    if (ham === null && hamCevaplar !== undefined) {
      yaz(ANAHTARLAR.beyanname, JSON.stringify(cevaplardanBaslat(jsonCoz<Cevaplar>(hamCevaplar, {}))));
      olay("beyanname_basladi");
    }
  }, [ham, hamCevaplar]);
  useEffect(() => {
    if (ilkCizim.current) {
      ilkCizim.current = false;
      return;
    }
    baslik.current?.focus();
  }, [adim]);

  if (ham === undefined || !kayitli) return <p className="text-base text-metin-ikincil">Yükleniyor…</p>;
  const v = kayitli;
  const guncelle = (f: (d: BeyannameVerisi) => void) => {
    const kopya = structuredClone(v);
    f(kopya);
    yaz(ANAHTARLAR.beyanname, JSON.stringify(kopya));
  };
  const ozet = beyannameOzeti(v, parametreler);
  const ekler = ekListesi(v, icerik);
  const git = (n: number) => {
    setAdim(n);
    document.getElementById("beyanname-adimlar")?.scrollIntoView();
  };

  return (
    <div>
      <div className="print:hidden">
        <div role="note" className="rounded-xl border-l-4 border-altin bg-altin-acik px-4 py-3 text-base">
          Yazdıklarınız yalnızca bu cihazda saklanır, hiçbir yere gönderilmez. T.C. kimlik numarası gibi bilgileri
          çıktıya elle yazın. Sonuçlar tahminidir; vergi dairesi kendi hesabını yapar.
        </div>

        <nav id="beyanname-adimlar" aria-label="Beyanname adımları" className="mt-6 scroll-mt-4">
          <p className="text-base text-metin-ikincil">
            Adım {adim + 1} / {ADIMLAR.length}
            <span className="sm:hidden">: {ADIMLAR[adim].ad}</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-bilgi-acik" aria-hidden="true">
            <div className="h-full rounded-full bg-altin transition-[width]" style={{ width: `${((adim + 1) / ADIMLAR.length) * 100}%` }} />
          </div>
          <ol className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {ADIMLAR.map((a, i) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => git(i)}
                  aria-current={i === adim ? "step" : undefined}
                  className={`min-h-11 rounded-full border px-3 text-base ${
                    i === adim ? "border-vurgu-koyu bg-vurgu-koyu text-white" : "border-cizgi bg-yuzey hover:border-vurgu"
                  }`}
                >
                  {i + 1}. {a.ad}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section className="mt-6 space-y-5 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6" aria-labelledby="adim-baslik">
          <h2 id="adim-baslik" ref={baslik} tabIndex={-1} className="font-serif text-2xl font-semibold text-vurgu-koyu outline-none">
            {ADIMLAR[adim].ad}
          </h2>

          {adim === 0 && (
            <>
              <Alan etiket="Vefat edenin adı soyadı" deger={v.muris.ad} onChange={(x) => guncelle((d) => void (d.muris.ad = x))} />
              <Alan
                etiket="Vefat tarihi"
                tip="date"
                deger={v.muris.vefat_tarihi}
                onChange={(x) => guncelle((d) => void (d.muris.vefat_tarihi = x))}
              />
              <Alan
                etiket="Son ikamet ettiği il ve ilçe"
                aciklama="Beyanname bu yerin bağlı olduğu vergi dairesine verilir."
                ornek="Örn. Kadıköy, İstanbul"
                deger={v.muris.ikamet}
                onChange={(x) => guncelle((d) => void (d.muris.ikamet = x))}
              />
              <Alan
                etiket="Toplam miras paydası"
                aciklama="Mirasçılık belgesinde yazar. Örneğin paylar 2/8, 3/8, 3/8 ise payda 8'dir."
                ornek="Örn. 8"
                sayi
                deger={v.payda}
                onChange={(x) => guncelle((d) => void (d.payda = x))}
              />
            </>
          )}

          {adim === 1 && (
            <>
              <p className="text-base text-metin-ikincil">
                Mirasçılık belgesindeki herkesi ekleyin. Beyannameyi hep birlikte ya da her biriniz ayrı verebilirsiniz.
              </p>
              {v.mirascilar.map((m, i) => (
                <Kart key={m.id} baslik={m.ad || `Mirasçı ${i + 1}`} onSil={() => guncelle((d) => void d.mirascilar.splice(i, 1))}>
                  <Alan etiket="Adı soyadı" deger={m.ad} onChange={(x) => guncelle((d) => void (d.mirascilar[i].ad = x))} />
                  <div>
                    <label htmlFor={`yak-${m.id}`} className="block font-semibold">
                      Vefat edene yakınlığı
                    </label>
                    <select
                      id={`yak-${m.id}`}
                      value={m.yakinlik}
                      onChange={(e) => guncelle((d) => void (d.mirascilar[i].yakinlik = e.target.value as Yakinlik))}
                      className={`${kutu} mt-2`}
                    >
                      {Object.entries(YAKINLIK_ETIKETLERI).map(([k, ad]) => (
                        <option key={k} value={k}>
                          {ad}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Alan
                    etiket={`Payı${v.payda ? ` (… / ${v.payda})` : ""}`}
                    aciklama="Mirasçılık belgesindeki payın üst sayısı. Örneğin 3/8 ise 3 yazın."
                    sayi
                    deger={m.pay}
                    onChange={(x) => guncelle((d) => void (d.mirascilar[i].pay = x))}
                  />
                </Kart>
              ))}
              <EkleDugmesi onClick={() => guncelle((d) => void d.mirascilar.push({ id: yeniKimlik(), ad: "", yakinlik: "cocuk", pay: "" }))}>
                Mirasçı ekle
              </EkleDugmesi>
              {ozet.payToplami !== null && ozet.payda !== null && ozet.payToplami !== ozet.payda && (
                <p role="status" className="rounded-xl bg-uyari-acik px-4 py-3 text-base text-uyari">
                  Payların toplamı {ozet.payToplami}/{ozet.payda}. Mirasçılık belgesindeki paylarla karşılaştırın; toplam
                  {` ${ozet.payda}/${ozet.payda}`} olmalı.
                </p>
              )}
            </>
          )}

          {adim === 2 && (
            <>
              <Yardim>{icerik.tasinmaz.deger_nasil}</Yardim>
              {v.tasinmazlar.map((t, i) => (
                <Kart key={t.id} baslik={`Taşınmaz ${i + 1}`} onSil={() => guncelle((d) => void d.tasinmazlar.splice(i, 1))}>
                  <div>
                    <label htmlFor={`tur-${t.id}`} className="block font-semibold">
                      Türü
                    </label>
                    <select
                      id={`tur-${t.id}`}
                      value={t.tur}
                      onChange={(e) => guncelle((d) => void (d.tasinmazlar[i].tur = e.target.value))}
                      className={`${kutu} mt-2`}
                    >
                      {icerik.tasinmaz.turler.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.ad}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Alan
                    etiket="Yeri (il, ilçe, ada/parsel)"
                    ornek="Örn. Çankaya, Ankara, 1234 ada 5 parsel"
                    deger={t.konum}
                    onChange={(x) => guncelle((d) => void (d.tasinmazlar[i].konum = x))}
                  />
                  <Alan
                    etiket="Vefat edenin hissesi"
                    aciklama="Tapuda yazar. Tamamı onunsa boş bırakın; yarısıysa 1/2 yazın."
                    ornek="Örn. 1/2"
                    deger={t.hisse}
                    hata={hisseOku(t.hisse) === null ? "Hisseyi 1/2 gibi yazın ya da boş bırakın." : undefined}
                    onChange={(x) => guncelle((d) => void (d.tasinmazlar[i].hisse = x))}
                  />
                  <TutarAlani
                    etiket="Emlak vergisi değeri (TL)"
                    aciklama="Belediye yazısındaki, taşınmazın tamamının değeri. Hisse oranı otomatik uygulanır."
                    deger={t.deger}
                    onChange={(x) => guncelle((d) => void (d.tasinmazlar[i].deger = x))}
                  />
                </Kart>
              ))}
              <EkleDugmesi
                onClick={() => guncelle((d) => void d.tasinmazlar.push({ id: yeniKimlik(), tur: "konut", konum: "", hisse: "", deger: "" }))}
              >
                Taşınmaz ekle
              </EkleDugmesi>
              {v.tasinmazlar.length === 0 && <Bos>Taşınmaz yoksa bu adımı geçin.</Bos>}
            </>
          )}

          {adim === 3 && (
            <>
              <Yardim>{icerik.haklar.aciklama}</Yardim>
              {v.haklar.map((h, i) => (
                <Kart key={h.id} baslik={`Hak ${i + 1}`} onSil={() => guncelle((d) => void d.haklar.splice(i, 1))}>
                  <Alan
                    etiket="Açıklama"
                    ornek="Örn. bir kitabın telif hakkı"
                    deger={h.aciklama}
                    onChange={(x) => guncelle((d) => void (d.haklar[i].aciklama = x))}
                  />
                </Kart>
              ))}
              <EkleDugmesi onClick={() => guncelle((d) => void d.haklar.push({ id: yeniKimlik(), aciklama: "" }))}>Hak ekle</EkleDugmesi>
              {v.haklar.length === 0 && <Bos>Çoğu ailede bu bölüm boştur. Yoksa geçin.</Bos>}
            </>
          )}

          {adim === 4 && (
            <>
              <p className="text-base text-metin-ikincil">Banka hesabı, araç, döviz, hisse gibi taşınmaz dışındaki varlıklar.</p>
              {v.digerleri.map((k, i) => {
                const tur = icerik.digerleri.find((x) => x.id === k.tur) ?? icerik.digerleri[icerik.digerleri.length - 1];
                return (
                  <Kart key={k.id} baslik={tur.ad} onSil={() => guncelle((d) => void d.digerleri.splice(i, 1))}>
                    <Yardim>{tur.deger_nasil}</Yardim>
                    <Alan
                      etiket="Açıklama"
                      ornek={tur.ornek}
                      deger={k.aciklama}
                      onChange={(x) => guncelle((d) => void (d.digerleri[i].aciklama = x))}
                    />
                    <TutarAlani etiket="Değeri (TL)" deger={k.deger} onChange={(x) => guncelle((d) => void (d.digerleri[i].deger = x))} />
                  </Kart>
                );
              })}
              <TurSecerekEkle
                etiket="Varlık ekle"
                turler={icerik.digerleri}
                onEkle={(tur) => guncelle((d) => void d.digerleri.push({ id: yeniKimlik(), tur, aciklama: "", deger: "" }))}
              />
              <details className="text-base">
                <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-vurgu-koyu">Beyan edilmeyenler</summary>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {icerik.beyan_edilmeyenler.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </details>
            </>
          )}

          {adim === 5 && (
            <>
              <Yardim>{icerik.borclar.aciklama}</Yardim>
              {v.borclar.map((b, i) => {
                const tur = icerik.borclar.turler.find((x) => x.id === b.tur) ?? icerik.borclar.turler[0];
                return (
                  <Kart key={b.id} baslik={tur.ad} onSil={() => guncelle((d) => void d.borclar.splice(i, 1))}>
                    <p className="text-base text-metin-ikincil">{tur.not}</p>
                    <Alan
                      etiket="Açıklama"
                      ornek={tur.ornek}
                      deger={b.aciklama}
                      onChange={(x) => guncelle((d) => void (d.borclar[i].aciklama = x))}
                    />
                    <TutarAlani
                      etiket="Tutar (TL)"
                      aciklama="Vefat tarihindeki kalan borç."
                      deger={b.tutar}
                      onChange={(x) => guncelle((d) => void (d.borclar[i].tutar = x))}
                    />
                  </Kart>
                );
              })}
              <TurSecerekEkle
                etiket="Borç veya masraf ekle"
                turler={icerik.borclar.turler}
                onEkle={(tur) => guncelle((d) => void d.borclar.push({ id: yeniKimlik(), tur, aciklama: "", tutar: "" }))}
              />
            </>
          )}

          {adim === 6 && (
            <>
              <p className="text-base text-metin-ikincil">
                Girdiğiniz varlıklara göre beyannameye eklenecek belgeler. Elinizde olanları işaretleyin.
              </p>
              <ul className="space-y-2">
                {ekler.map((e) => {
                  const hazir = v.hazirEkler.includes(e.id);
                  return (
                    <li key={e.id}>
                      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-cizgi px-4 py-3">
                        <input
                          type="checkbox"
                          checked={hazir}
                          onChange={() =>
                            guncelle((d) => {
                              d.hazirEkler = hazir ? d.hazirEkler.filter((x) => x !== e.id) : [...d.hazirEkler, e.id];
                            })
                          }
                          className="mt-1 size-6 shrink-0 accent-vurgu-koyu"
                        />
                        <span>
                          <span className={hazir ? "text-metin-ikincil line-through" : ""}>{e.ad}</span>
                          {e.neden && <span className="block text-base text-metin-ikincil">{e.neden}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {adim === 7 && (
            <>
              {ozet.eksikDeger > 0 && (
                <p role="status" className="rounded-xl bg-uyari-acik px-4 py-3 text-base text-uyari">
                  {ozet.eksikDeger} kalemin tutarı boş ya da okunamadı; toplama eklenmedi. İlgili adıma dönüp tamamlayın.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  olay("beyanname_yazdirildi");
                  window.print();
                }}
                className="dugme dugme-birincil"
              >
                Hazırlık dosyasını yazdır
              </button>
              <BeyannameDosyasi veri={v} ozet={ozet} ekler={ekler} icerik={icerik} />
            </>
          )}

          <div className="flex flex-wrap gap-3 border-t border-cizgi pt-5">
            {adim > 0 && (
              <button type="button" onClick={() => git(adim - 1)} className="dugme dugme-ikincil">
                Geri
              </button>
            )}
            {adim < ADIMLAR.length - 1 && (
              <button type="button" onClick={() => git(adim + 1)} className="dugme dugme-birincil">
                Devam: {ADIMLAR[adim + 1].ad}
              </button>
            )}
          </div>
        </section>

        <p className="mt-4 text-base text-metin-ikincil">
          Şu ana kadarki toplam: {tl(ozet.net)} (borçlar düşülmüş). Bilgileriniz kaydedildi; sonra kaldığınız yerden devam edebilirsiniz.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Beyanname için girdiğiniz tüm bilgiler bu cihazdan silinsin mi?")) {
              yaz(ANAHTARLAR.beyanname, JSON.stringify(bosVeri()));
              git(0);
            }
          }}
          className="mt-2 min-h-11 text-base text-metin-ikincil underline underline-offset-4"
        >
          Bilgileri sil ve baştan başla
        </button>
      </div>

      <div className="hidden print:block">
        <BeyannameDosyasi veri={v} ozet={ozet} ekler={ekler} icerik={icerik} />
      </div>
    </div>
  );
}

function Alan({
  etiket,
  aciklama,
  ornek,
  deger,
  onChange,
  tip = "text",
  sayi,
  hata,
}: {
  etiket: string;
  aciklama?: string;
  ornek?: string;
  deger: string;
  onChange: (x: string) => void;
  tip?: "text" | "date";
  sayi?: boolean;
  hata?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {etiket}
      </label>
      {aciklama && (
        <p id={`${id}-a`} className="text-base text-metin-ikincil">
          {aciklama}
        </p>
      )}
      <input
        id={id}
        type={tip}
        inputMode={sayi ? "numeric" : undefined}
        autoComplete="off"
        placeholder={ornek}
        value={deger}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={aciklama ? `${id}-a` : undefined}
        aria-invalid={hata ? true : undefined}
        className={`${kutu} mt-2`}
      />
      {hata && <p className="mt-1 text-base text-uyari">{hata}</p>}
    </div>
  );
}

function TutarAlani({ etiket, aciklama, deger, onChange }: { etiket: string; aciklama?: string; deger: string; onChange: (x: string) => void }) {
  const n = tutarOku(deger);
  return (
    <div>
      <Alan etiket={etiket} aciklama={aciklama} ornek="Örn. 1.250.000" deger={deger} onChange={onChange} hata={deger && n === null ? "Yalnızca rakam yazın (ör. 1.250.000)." : undefined} />
      {n !== null && <p className="mt-1 text-base text-metin-ikincil">{tl(n)}</p>}
    </div>
  );
}

function Kart({ baslik, onSil, children }: { baslik: string; onSil: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-cizgi p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{baslik}</h3>
        <button type="button" onClick={onSil} className="min-h-11 shrink-0 px-2 text-base text-uyari underline underline-offset-4">
          Sil<span className="sr-only">: {baslik}</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function EkleDugmesi({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="dugme dugme-ikincil">
      + {children}
    </button>
  );
}

function TurSecerekEkle({ etiket, turler, onEkle }: { etiket: string; turler: { id: string; ad: string }[]; onEkle: (tur: string) => void }) {
  return (
    <div>
      <p className="font-semibold">{etiket}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {turler.map((t) => (
          <button key={t.id} type="button" onClick={() => onEkle(t.id)} className="min-h-11 rounded-full border border-cizgi bg-yuzey px-3 text-base hover:border-vurgu">
            + {t.ad}
          </button>
        ))}
      </div>
    </div>
  );
}

function Yardim({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-vurgu-acik px-4 py-3 text-base">{children}</p>;
}

function Bos({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-metin-ikincil">{children}</p>;
}
