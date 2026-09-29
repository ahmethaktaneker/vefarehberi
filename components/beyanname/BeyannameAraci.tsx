"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import {
  YAKINLIK_ETIKETLERI,
  beyannameOzeti,
  bosVeri,
  ekListesi,
  hisseOku,
  veriyiTamamla,
  yeniBorc,
  yeniKalem,
  yeniMirasci,
  yeniTasinmaz,
  type BeyannameVerisi,
  type Muris,
  type Yakinlik,
} from "@/lib/beyanname/hesap";
import type { BeyannameIcerik } from "@/lib/beyanname/sema";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import { tutarOku } from "@/lib/hesaplayici";
import { PDF_GENISLIK_PX, formuPdfYap } from "@/lib/pdf";
import type { Parametreler } from "@/lib/icerik/sema";
import type { Cevaplar } from "@/lib/sorular";
import { CihazdaKalir } from "@/components/CihazdaKalir";
import { ResmiForm } from "./ResmiForm";

const PDF_ADI = "veraset-beyannamesi.pdf";
const kutu = "min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg";
const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tl = (n: number) => `${para.format(n)} TL`;

const ADIMLAR = [
  { id: "muris", ad: "Vefat eden" },
  { id: "mirascilar", ad: "Mirasçılar" },
  { id: "tasinmaz", ad: "Taşınmazlar" },
  { id: "diger", ad: "Diğer varlıklar" },
  { id: "borclar", ad: "Borç ve masraflar" },
  { id: "ekler", ad: "Eklenecek belgeler" },
  { id: "form", ad: "Beyanname formu" },
] as const;

/** İlk açılışta, listedeki cevaplardan başlangıç verisi: varlık türleri boş satır olarak gelir. */
function cevaplardanBaslat(c: Cevaplar): BeyannameVerisi {
  const v = bosVeri();
  v.muris.vefat_tarihi = typeof c.vefat_tarihi === "string" ? c.vefat_tarihi : "";
  const varliklar = Array.isArray(c.varliklar) ? c.varliklar : [];
  if (varliklar.includes("ev_arsa")) v.tasinmazlar.push(yeniTasinmaz());
  if (varliklar.includes("baska_sehir_tasinmaz")) v.tasinmazlar.push(yeniTasinmaz());
  if (varliklar.includes("banka")) v.digerleri.push(yeniKalem("banka"));
  if (varliklar.includes("arac")) v.digerleri.push(yeniKalem("arac"));
  if (varliklar.includes("sirket")) v.digerleri.push(yeniKalem("ticari"));
  if (varliklar.includes("kredi")) v.borclar.push(yeniBorc("belgeli_borc"));
  if (varliklar.includes("kredi_karti")) v.borclar.push(yeniBorc("belgeli_borc"));
  return v;
}

export function BeyannameAraci({ icerik, parametreler }: { icerik: BeyannameIcerik; parametreler: Parametreler }) {
  const ham = useDepo(ANAHTARLAR.beyanname);
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const [adim, setAdim] = useState(0);
  const [pdfDurum, setPdfDurum] = useState<"bos" | "hazirlaniyor" | "hata">("bos");
  // url: PDF olarak açmak için; indirUrl: iPhone Safari PDF'i açmak yerine indirsin diye genel dosya türüyle.
  const [pdf, setPdf] = useState<{ url: string; indirUrl: string; dosya: File } | null>(null);
  useEffect(
    () => () => {
      if (!pdf) return;
      URL.revokeObjectURL(pdf.url);
      URL.revokeObjectURL(pdf.indirUrl);
    },
    [pdf],
  );
  const pdfKap = useRef<HTMLDivElement>(null);
  const baslik = useRef<HTMLHeadingElement>(null);
  const ilkCizim = useRef(true);

  const kayitli = useMemo(() => (ham ? veriyiTamamla(jsonCoz<unknown>(ham, {})) : null), [ham]);
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
    baslik.current?.focus({ preventScroll: true });
  }, [adim]);

  if (!kayitli) return <p className="text-base text-metin-ikincil">Yükleniyor…</p>;
  const v = kayitli;
  const guncelle = (f: (d: BeyannameVerisi) => void) => {
    const kopya = structuredClone(v);
    f(kopya);
    yaz(ANAHTARLAR.beyanname, JSON.stringify(kopya));
  };
  const murisAlani = (k: keyof Muris) => ({ deger: v.muris[k], onChange: (x: string) => guncelle((d) => void (d.muris[k] = x)) });
  const ozet = beyannameOzeti(v, parametreler);
  const ekler = ekListesi(v, icerik);
  async function pdfPaylas() {
    if (!pdf) return;
    try {
      await navigator.share({ files: [pdf.dosya], title: "Veraset beyannamesi" });
    } catch {
      // Kullanıcı paylaşım penceresini kapattıysa bir şey yapma.
    }
  }
  const paylasilabilir = typeof navigator !== "undefined" && !!pdf && !!navigator.canShare?.({ files: [pdf.dosya] });

  async function pdfIndir() {
    if (!pdfKap.current) return;
    setPdfDurum("hazirlaniyor");
    try {
      const blob = await formuPdfYap(pdfKap.current);
      const dosya = new File([blob], PDF_ADI, { type: "application/pdf" });
      setPdf({
        url: URL.createObjectURL(dosya),
        indirUrl: URL.createObjectURL(new Blob([blob], { type: "application/octet-stream" })),
        dosya,
      });
      olay("beyanname_yazdirildi");
      setPdfDurum("bos");
    } catch {
      setPdfDurum("hata");
    }
  }
  const git = (n: number) => {
    setAdim(n);
    document.getElementById("beyanname-adimlar")?.scrollIntoView();
  };

  return (
    <>
      <div className="ekran-icerik">
        <p className="text-base text-metin-ikincil">Bilmediğiniz alanları boş bırakın; formda boş çıkar, elle doldurursunuz.</p>

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
          <CihazdaKalir kutu>Bu sayfaya yazdıklarınızı biz görmüyoruz; yalnızca bu cihazda kalır.</CihazdaKalir>

          {adim === 0 && (
            <>
              <Grup baslik="Kimlik">
                <Alan etiket="T.C. kimlik numarası" sayi gizli {...murisAlani("tc")} aciklama="İsterseniz boş bırakıp çıktıya elle yazın." />
                <Izgara>
                  <Alan etiket="Adı" {...murisAlani("ad")} />
                  <Alan etiket="Soyadı" {...murisAlani("soyad")} />
                  <Alan etiket="Baba adı" {...murisAlani("baba_adi")} />
                  <Alan etiket="Mesleği" ornek="Örn. emekli öğretmen" {...murisAlani("meslek")} />
                  <Alan etiket="Ölüm yeri" ornek="Örn. İstanbul" {...murisAlani("olum_yeri")} />
                  <Alan etiket="Ölüm tarihi" tip="date" {...murisAlani("vefat_tarihi")} />
                </Izgara>
              </Grup>
              <Grup baslik="Son ikamet adresi">
                <Izgara>
                  <Alan etiket="Mahalle" {...murisAlani("mahalle")} />
                  <Alan etiket="Cadde / sokak" {...murisAlani("cadde_sokak")} />
                  <Alan etiket="Kapı no" {...murisAlani("kapi_no")} />
                  <Alan etiket="Daire no" {...murisAlani("daire_no")} />
                  <Alan etiket="İl / ilçe" ornek="Örn. İstanbul / Kadıköy" {...murisAlani("il_ilce")} />
                  <Alan etiket="Posta kodu" sayi {...murisAlani("posta_kodu")} />
                </Izgara>
                <CihazdaKalir>Adres bilgilerini biz görmüyoruz; yalnızca bu cihazda kalır.</CihazdaKalir>
              </Grup>
              <Grup baslik="Vergi dairesi">
                <p className="text-base text-metin-ikincil">{icerik.vergi_dairesi}</p>
                <Izgara>
                  <Alan
                    etiket="Vergi dairesinin adı"
                    ornek="Örn. Kadıköy"
                    aciklama="Bilmiyorsanız son ikamet adresinin bağlı olduğu vergi dairesini internette aratın."
                    deger={v.vergi_dairesi}
                    onChange={(x) => guncelle((d) => void (d.vergi_dairesi = x))}
                  />
                  <Alan etiket="Vergi dairesinin il / ilçesi" deger={v.vd_il_ilce} onChange={(x) => guncelle((d) => void (d.vd_il_ilce = x))} />
                </Izgara>
              </Grup>
              <Grup baslik="Miras paydası">
                <Alan
                  etiket="Toplam miras paydası"
                  aciklama="Mirasçılık belgesinde yazar. Örneğin paylar 2/8, 3/8, 3/8 ise payda 8'dir. Vergiyi hesaplamak için kullanılır; formda yer almaz."
                  ornek="Örn. 8"
                  sayi
                  deger={v.payda}
                  onChange={(x) => guncelle((d) => void (d.payda = x))}
                />
              </Grup>
            </>
          )}

          {adim === 1 && (
            <>
              <p className="text-base text-metin-ikincil">
                Mirasçılık belgesindeki herkesi ekleyin. Beyannameyi birlikte veriyorsanız herkes formdaki kendi satırını imzalar.
              </p>
              {v.mirascilar.map((m, i) => {
                const alan = (k: "tc" | "ad" | "dogum_tarihi" | "adres_tel" | "pay") => ({
                  deger: m[k],
                  onChange: (x: string) => guncelle((d) => void (d.mirascilar[i][k] = x)),
                });
                return (
                  <Kart key={m.id} baslik={m.ad || `Mirasçı ${i + 1}`} onSil={() => guncelle((d) => void d.mirascilar.splice(i, 1))}>
                    <Izgara>
                      <Alan etiket="Adı soyadı" {...alan("ad")} />
                      <Secim
                        etiket="Vefat edene yakınlığı"
                        deger={m.yakinlik}
                        secenekler={Object.entries(YAKINLIK_ETIKETLERI)}
                        onChange={(x) => guncelle((d) => void (d.mirascilar[i].yakinlik = x as Yakinlik))}
                      />
                      <Alan etiket="T.C. kimlik numarası" sayi gizli {...alan("tc")} />
                      <Alan etiket="Doğum tarihi" tip="date" {...alan("dogum_tarihi")} />
                    </Izgara>
                    <Alan etiket="Adresi ve telefonu" ornek="Örn. Moda Mah. ... Kadıköy / İstanbul, 0555 ..." gizli {...alan("adres_tel")} />
                    <Alan
                      etiket={`Payı${v.payda ? ` (… / ${v.payda})` : ""}`}
                      aciklama="Mirasçılık belgesindeki payın üst sayısı. Örneğin 3/8 ise 3 yazın."
                      sayi
                      {...alan("pay")}
                    />
                  </Kart>
                );
              })}
              <EkleDugmesi onClick={() => guncelle((d) => void d.mirascilar.push(yeniMirasci()))}>Mirasçı ekle</EkleDugmesi>
              {ozet.payToplami !== null && ozet.payda !== null && ozet.payToplami !== ozet.payda && (
                <p role="status" className="rounded-xl bg-uyari-acik px-4 py-3 text-base text-uyari">
                  Payların toplamı {ozet.payToplami}/{ozet.payda}. Mirasçılık belgesindeki paylarla karşılaştırın; toplam{" "}
                  {ozet.payda}/{ozet.payda} olmalı.
                </p>
              )}
            </>
          )}

          {adim === 2 && (
            <>
              <Yardim>{icerik.tasinmaz.deger_nasil}</Yardim>
              {v.tasinmazlar.map((t, i) => {
                const alan = (k: "il" | "ilce" | "mahalle" | "sokak" | "kapi_no" | "ada" | "parsel") => ({
                  deger: t[k],
                  onChange: (x: string) => guncelle((d) => void (d.tasinmazlar[i][k] = x)),
                });
                return (
                  <Kart key={t.id} baslik={`Taşınmaz ${i + 1}`} onSil={() => guncelle((d) => void d.tasinmazlar.splice(i, 1))}>
                    <Secim
                      etiket="Cinsi"
                      deger={t.tur}
                      secenekler={icerik.tasinmaz.turler.map((x) => [x.id, x.ad])}
                      onChange={(x) => guncelle((d) => void (d.tasinmazlar[i].tur = x))}
                    />
                    <Izgara>
                      <Alan etiket="İl" {...alan("il")} />
                      <Alan etiket="İlçe" {...alan("ilce")} />
                      <Alan etiket="Mahalle veya köy" {...alan("mahalle")} />
                      <Alan etiket="Sokak" {...alan("sokak")} />
                      <Alan etiket="Kapı no" {...alan("kapi_no")} />
                      <Alan
                        etiket="Vefat edenin hissesi"
                        ornek="Tamamıysa boş bırakın; yarısıysa 1/2"
                        deger={t.hisse}
                        hata={hisseOku(t.hisse) === null ? "Hisseyi 1/2 gibi yazın ya da boş bırakın." : undefined}
                        onChange={(x) => guncelle((d) => void (d.tasinmazlar[i].hisse = x))}
                      />
                      <Alan etiket="Ada no" aciklama="Tapuda yazar." sayi {...alan("ada")} />
                      <Alan etiket="Parsel no" aciklama="Tapuda yazar." sayi {...alan("parsel")} />
                    </Izgara>
                    <TutarAlani
                      etiket="Emlak vergisi değeri (TL)"
                      aciklama="Belediye yazısındaki, taşınmazın tamamının değeri. Forma hisseye düşen tutar yazılır; bunu biz hesaplarız."
                      deger={t.deger}
                      onChange={(x) => guncelle((d) => void (d.tasinmazlar[i].deger = x))}
                    />
                  </Kart>
                );
              })}
              <EkleDugmesi onClick={() => guncelle((d) => void d.tasinmazlar.push(yeniTasinmaz()))}>Taşınmaz ekle</EkleDugmesi>
              {v.tasinmazlar.length === 0 && <Bos>Taşınmaz yoksa bu adımı geçin.</Bos>}
            </>
          )}

          {adim === 3 && (
            <>
              <p className="text-base text-metin-ikincil">Banka hesabı, araç, döviz, hisse gibi taşınmaz dışındaki varlıklar.</p>
              {v.digerleri.map((k, i) => {
                const tur = icerik.digerleri.find((x) => x.id === k.tur) ?? icerik.digerleri[icerik.digerleri.length - 1];
                const alan = (a: "aciklama" | "nerede" | "adet" | "numara") => ({
                  deger: k[a],
                  onChange: (x: string) => guncelle((d) => void (d.digerleri[i][a] = x)),
                });
                return (
                  <Kart key={k.id} baslik={tur.ad} onSil={() => guncelle((d) => void d.digerleri.splice(i, 1))}>
                    <Yardim>{tur.deger_nasil}</Yardim>
                    <Alan etiket="Açıklama" ornek={tur.ornek} {...alan("aciklama")} />
                    <Izgara>
                      <Alan etiket="Nerede bulunduğu" ornek="Örn. Ziraat Bankası Kadıköy şubesi" {...alan("nerede")} />
                      <Alan etiket="Adedi" sayi {...alan("adet")} />
                    </Izgara>
                    <Alan etiket="Hesap no / plaka / poliçe no" {...alan("numara")} />
                    <TutarAlani etiket="Değeri (TL)" deger={k.deger} onChange={(x) => guncelle((d) => void (d.digerleri[i].deger = x))} />
                  </Kart>
                );
              })}
              <TurSecerekEkle etiket="Varlık ekle" turler={icerik.digerleri} onEkle={(tur) => guncelle((d) => void d.digerleri.push(yeniKalem(tur)))} />
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

          {adim === 4 && (
            <>
              <Yardim>{icerik.borclar.aciklama}</Yardim>
              {v.borclar.map((b, i) => {
                const tur = icerik.borclar.turler.find((x) => x.id === b.tur) ?? icerik.borclar.turler[0];
                const alan = (a: "aciklama" | "belge_cinsi" | "belge_tarihi" | "belge_no" | "alacakli" | "alacakli_adres") => ({
                  deger: b[a],
                  onChange: (x: string) => guncelle((d) => void (d.borclar[i][a] = x)),
                });
                return (
                  <Kart key={b.id} baslik={tur.ad} onSil={() => guncelle((d) => void d.borclar.splice(i, 1))}>
                    <p className="text-base text-metin-ikincil">{tur.not}</p>
                    <Alan etiket="Açıklama" ornek={tur.ornek} {...alan("aciklama")} />
                    <Izgara>
                      <Alan etiket="Belgenin cinsi" ornek="Örn. kredi sözleşmesi, fatura" {...alan("belge_cinsi")} />
                      <Alan etiket="Belgenin tarihi" tip="date" {...alan("belge_tarihi")} />
                      <Alan etiket="Belgenin numarası" {...alan("belge_no")} />
                      <Alan etiket="Alacaklı" ornek="Örn. banka adı" {...alan("alacakli")} />
                    </Izgara>
                    <Alan etiket="Alacaklının adresi" {...alan("alacakli_adres")} />
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
                onEkle={(tur) => guncelle((d) => void d.borclar.push(yeniBorc(tur)))}
              />
            </>
          )}

          {adim === 5 && (
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

          {adim === 6 && (
            <>
              {ozet.eksikDeger > 0 && (
                <p role="status" className="rounded-xl bg-uyari-acik px-4 py-3 text-base text-uyari">
                  {ozet.eksikDeger} kalemin tutarı boş ya da okunamadı. Formda o satırın tutarı boş çıkar; ilgili adıma dönüp
                  tamamlayabilir ya da elle yazabilirsiniz.
                </p>
              )}

              <div className="rounded-xl border-2 border-vurgu-koyu p-4">
                <h3 className="font-serif text-xl font-semibold text-vurgu-koyu">Vergi</h3>
                <dl className="mt-2 space-y-1 text-base">
                  <OzetSatiri ad="Varlıklar toplamı" deger={tl(ozet.brut)} />
                  <OzetSatiri ad="Borç ve masraflar" deger={`− ${tl(ozet.indirim)}`} />
                  <OzetSatiri ad="Net miras" deger={tl(ozet.net)} kalin />
                </dl>
                {ozet.mirascilar.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-cizgi pt-3 text-base">
                    {ozet.mirascilar.map((m) => (
                      <li key={m.mirasci.id} className="flex flex-wrap justify-between gap-x-3">
                        <span>{m.mirasci.ad || YAKINLIK_ETIKETLERI[m.mirasci.yakinlik]}</span>
                        <span>{m.vergi && m.tutar !== null ? `${tl(m.vergi.vergi)} vergi (payı ${tl(m.tutar)})` : "Pay girilmedi"}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-base text-metin-ikincil">Vergi çıkarsa 3 yılda, mayıs ve kasım aylarında 6 eşit taksitte ödenir.</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={pdfIndir}
                  disabled={pdfDurum === "hazirlaniyor"}
                  className={`dugme ${pdf ? "dugme-ikincil" : "dugme-birincil"}`}
                >
                  {pdfDurum === "hazirlaniyor" ? "PDF hazırlanıyor…" : pdf ? "PDF'i yeniden hazırla" : "PDF hazırla"}
                </button>
                <p className="text-base text-metin-ikincil">PDF&apos;i indirip açın ve oradan yazdırın; form A4 sayfaya tam sığar.</p>
                {pdf && (
                  <div role="status" className="space-y-3 rounded-xl border-2 border-vurgu bg-vurgu-acik p-4">
                    <p className="font-semibold text-vurgu-koyu">PDF hazır.</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <a href={pdf.indirUrl} download={PDF_ADI} className="dugme dugme-birincil">
                        PDF&apos;i indir
                      </a>
                      {paylasilabilir && (
                        <button type="button" onClick={pdfPaylas} className="dugme dugme-ikincil">
                          Dosyalar&apos;a kaydet veya paylaş
                        </button>
                      )}
                      <a href={pdf.url} target="_blank" rel="noopener" className="dugme dugme-ikincil">
                        Yeni sekmede aç<span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </div>
                    <p className="text-base text-metin-ikincil">
                      iPhone&apos;da indirilen dosya Dosyalar uygulamasındaki İndirilenler klasörüne gider. Doğrudan yazdırmak için
                      &ldquo;Dosyalar&apos;a kaydet veya paylaş&rdquo; düğmesinden &ldquo;Yazdır&rdquo;ı seçebilirsiniz.
                    </p>
                  </div>
                )}
                {pdfDurum === "hata" && <p className="text-base text-uyari">PDF hazırlanamadı. Sayfayı yenileyip tekrar deneyin.</p>}
                <ol className="list-decimal space-y-1 pl-5 text-base">
                  <li>Formu iki sayfa olarak yazdırın (arkalı önlü de olur).</li>
                  <li>Boş kalan yerleri elle doldurun. Mirasçılar, ön yüzdeki kendi satırlarını imzalar.</li>
                  <li>Eklenecek belgelerle birlikte vergi dairesine götürün.</li>
                </ol>
                <p className="text-base text-metin-ikincil">{icerik.cevrimici}</p>
              </div>

              <div>
                <h3 className="font-serif text-xl font-semibold text-vurgu-koyu">Önizleme</h3>
                <p className="text-base text-metin-ikincil">
                  GİB&apos;in resmi Veraset ve İntikal Vergisi Beyannamesi (1031 A) düzeninde. Telefonda yana kaydırarak bakabilirsiniz.
                </p>
                <div className="mt-3 overflow-x-auto rounded-xl border border-cizgi bg-white p-4">
                  <div className="min-w-[720px]">
                    <ResmiForm veri={v} icerik={icerik} />
                  </div>
                </div>
              </div>
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

        <p className="mt-4 text-base text-metin-ikincil">Şu ana kadarki net toplam: {tl(ozet.net)}. Kaldığınız yerden devam edebilirsiniz.</p>
        <p className="mt-1 text-sm text-metin-ikincil">
          Bilgileriniz yalnızca bu cihazda kaydedilir, hiçbir yere gönderilmez. Kesin vergiyi vergi dairesi hesaplar.
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

      <div className="form-yazdirma">
        <ResmiForm veri={v} icerik={icerik} />
      </div>
      {adim === ADIMLAR.length - 1 && (
        <div aria-hidden="true" className="yazdirma-gizle pointer-events-none fixed top-0 -left-[9999px]" style={{ width: PDF_GENISLIK_PX }}>
          <div ref={pdfKap}>
            <ResmiForm veri={v} icerik={icerik} />
          </div>
        </div>
      )}
    </>
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
  gizli,
}: {
  etiket: string;
  aciklama?: string;
  ornek?: string;
  deger: string;
  onChange: (x: string) => void;
  tip?: "text" | "date";
  sayi?: boolean;
  hata?: string;
  /** Hassas bilgi: altında "bunu biz görmüyoruz" notu çıkar. */
  gizli?: boolean;
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
      {gizli && <CihazdaKalir className="mt-1" />}
    </div>
  );
}

function Secim({ etiket, deger, secenekler, onChange }: { etiket: string; deger: string; secenekler: [string, string][]; onChange: (x: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {etiket}
      </label>
      <select id={id} value={deger} onChange={(e) => onChange(e.target.value)} className={`${kutu} mt-2`}>
        {secenekler.map(([k, ad]) => (
          <option key={k} value={k}>
            {ad}
          </option>
        ))}
      </select>
    </div>
  );
}

function TutarAlani({ etiket, aciklama, deger, onChange }: { etiket: string; aciklama?: string; deger: string; onChange: (x: string) => void }) {
  const n = tutarOku(deger);
  return (
    <div>
      <Alan
        etiket={etiket}
        aciklama={aciklama}
        ornek="Örn. 1.250.000"
        deger={deger}
        onChange={onChange}
        hata={deger && n === null ? "Yalnızca rakam yazın (ör. 1.250.000)." : undefined}
      />
      {n !== null && <p className="mt-1 text-base text-metin-ikincil">{tl(n)}</p>}
    </div>
  );
}

function Grup({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-cizgi pt-4 first-of-type:border-t-0 first-of-type:pt-0">
    <fieldset className="space-y-4">
      <legend className="mb-2 font-serif text-lg font-semibold">{baslik}</legend>
      {children}
    </fieldset>
    </div>
  );
}

function Izgara({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
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
          <button
            key={t.id}
            type="button"
            onClick={() => onEkle(t.id)}
            className="min-h-11 rounded-full border border-cizgi bg-yuzey px-3 text-base hover:border-vurgu"
          >
            + {t.ad}
          </button>
        ))}
      </div>
    </div>
  );
}

function OzetSatiri({ ad, deger, kalin }: { ad: string; deger: string; kalin?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${kalin ? "font-semibold" : ""}`}>
      <dt>{ad}</dt>
      <dd>{deger}</dd>
    </div>
  );
}

function Yardim({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-vurgu-acik px-4 py-3 text-base">{children}</p>;
}

function Bos({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-metin-ikincil">{children}</p>;
}
