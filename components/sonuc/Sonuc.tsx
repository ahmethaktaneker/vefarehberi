"use client";

import Link from "next/link";
import { listeyiYazdir } from "@/lib/yazdir";
import { useMemo, useState, useSyncExternalStore } from "react";
import { olay } from "@/lib/analitik";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import type { Icerik } from "@/lib/icerik/sema";
import { bekledikleri, donemler, hazirBelgeler, siradakiAdim, simdikiDonem, yereGore } from "@/lib/kurallar/ilerleme";
import { listeOlustur } from "@/lib/kurallar/liste";
import { istanbulBugun, tarihMetni } from "@/lib/kurallar/tarih";
import type { Paket } from "@/lib/paket";
import { aracOnerileri, paketOnerisi } from "@/lib/araclar";
import { AracOnerileri } from "@/components/sonuc/AracOnerileri";
import { YakindaKutusu } from "@/components/sonuc/YakindaKutusu";
import { DeneyimKutusu } from "@/components/sonuc/DeneyimKutusu";
import { EPOSTA_TOPLAMA_AKTIF } from "@/lib/marka";
import { PAYLASIM_ANAHTARI, paylasimCoz, paylasimKodla } from "@/lib/paylasim";
import { akisTamam, gecerliCevaplar, type Cevaplar } from "@/lib/sorular";
import { AdimDetay } from "@/components/sonuc/AdimDetay";
import { BelgeKontrolListesi } from "@/components/sonuc/BelgeKontrolListesi";
import { KurumRehberi } from "@/components/sonuc/KurumRehberi";
import {
  Dosyaniz,
  Ilerleme,
  KisaListe,
  NereyeGit,
  OdakKarti,
  SonTarihKartlari,
  Tik,
  YER_SIRASI,
  Yolculuk,
  ZAMAN_ETIKETLERI,
} from "@/components/sonuc/ListeParcalari";
import { PaketKarti } from "@/components/sonuc/PaketKarti";
import { Panel, PanelSaglayici, type PanelDurumu } from "@/components/sonuc/Panel";
import { PaylasHatirla } from "@/components/sonuc/PaylasHatirla";

function hashAbone(f: () => void) {
  window.addEventListener("hashchange", f);
  return () => window.removeEventListener("hashchange", f);
}

function hashTemizle() {
  window.history.replaceState(null, "", window.location.pathname);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/**
 * Liste sayfası: tek bir "şimdi yapılacak" adımla açılır; yaklaşan son tarihler, dönemlere ayrılmış yolculuk
 * ve her şeyin toplandığı "Dosyanız". Ayrıntılar alttan açılan panelde.
 */
export function Sonuc({ icerik, paket, riza }: { icerik: Icerik; paket: Paket; riza: { surum: string; metin: string } }) {
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const hamYapilanlar = useDepo(ANAHTARLAR.yapilanlar);
  const hamBelgeler = useDepo(ANAHTARLAR.belgeler);
  const cevaplar = useMemo(() => jsonCoz<Cevaplar>(hamCevaplar, {}), [hamCevaplar]);
  const yapilanlar = useMemo(() => new Set(jsonCoz<string[]>(hamYapilanlar, [])), [hamYapilanlar]);
  const isaretliBelgeler = useMemo(() => new Set(jsonCoz<string[]>(hamBelgeler, [])), [hamBelgeler]);
  const bugun = istanbulBugun();
  const liste = useMemo(() => listeOlustur(cevaplar, icerik, bugun), [cevaplar, icerik, bugun]);
  const sonGuncelleme = useMemo(() => icerik.adimlar.reduce((m, a) => (a.son_kontrol > m ? a.son_kontrol : m), ""), [icerik]);
  const oneri = useMemo(() => paketOnerisi(cevaplar, liste, yapilanlar), [cevaplar, liste, yapilanlar]);
  const [panel, setPanel] = useState<PanelDurumu | null>(null);
  const [sonYapilan, setSonYapilan] = useState<string | null>(null);
  const hash = useSyncExternalStore(hashAbone, () => window.location.hash, () => "");
  const paylasilan = useMemo(() => {
    const m = new RegExp(`^#${PAYLASIM_ANAHTARI}=([0-9a-z.]+)$`).exec(hash);
    return m ? paylasimCoz(m[1]) : null;
  }, [hash]);

  if (hamCevaplar === undefined) return <p className="text-metin-ikincil">Yükleniyor…</p>;

  const ayniListe = paylasilan && paylasimKodla(gecerliCevaplar(paylasilan)) === paylasimKodla(gecerliCevaplar(cevaplar));
  if (paylasilan && akisTamam(paylasilan) && !ayniListe) {
    return (
      <PaylasimKabul
        mevcutVar={akisTamam(cevaplar)}
        onKabul={() => {
          yaz(ANAHTARLAR.cevaplar, JSON.stringify(paylasilan));
          yaz(ANAHTARLAR.soruSirasi, null);
          hashTemizle();
        }}
        onVazgec={hashTemizle}
      />
    );
  }

  if (!akisTamam(cevaplar)) {
    return (
      <div className="max-w-xl">
        <h1 className="font-serif text-3xl font-semibold text-vurgu-koyu">Listeniz henüz hazır değil</h1>
        <p className="mt-3 text-lg">Listenizi oluşturmak için önce birkaç kısa soruyu cevaplayın.</p>
        <Link href="/liste" className="dugme dugme-birincil mt-6">
          Sorulara başla
        </Link>
      </div>
    );
  }

  function isaretle(id: string, yapildi: boolean) {
    const yeni = new Set(yapilanlar);
    if (yapildi) {
      yeni.add(id);
      olay("adim_isaretlendi", { adim_id: id });
    } else yeni.delete(id);
    yaz(ANAHTARLAR.yapilanlar, JSON.stringify([...yeni]));
  }

  function belgeIsaretle(id: string, hazir: boolean) {
    const yeni = new Set(isaretliBelgeler);
    if (hazir) yeni.add(id);
    else yeni.delete(id);
    yaz(ANAHTARLAR.belgeler, JSON.stringify([...yeni]));
  }

  function panelAc(p: PanelDurumu) {
    setPanel(p);
    olay("bolum_goruntulendi", { bolum: p.tur });
  }

  const islemler = liste.adimlar.filter((a) => a.yer !== "dikkat");
  const uyarilar = liste.adimlar.filter((a) => a.yer === "dikkat");
  const siradaki = siradakiAdim(liste, yapilanlar);
  const yerler = yereGore(liste, icerik.belgeler, YER_SIRASI);
  const belgeDurumu = hazirBelgeler(isaretliBelgeler, liste, yapilanlar);
  const kalan = (kategori: string) => liste.adimlar.filter((a) => a.kategori === kategori && !yapilanlar.has(a.id)).length;
  const acikAdim = panel?.tur === "adim" ? liste.adimlar.find((a) => a.id === panel.id) : undefined;

  const panelBasligi = !panel
    ? ""
    : panel.tur === "adim"
      ? (acikAdim?.baslik ?? "")
      : {
          odemeler: "Size çıkabilecek ödemeler",
          riskler: "Borç ve risk kontrolü",
          belgeler: "Belgeleriniz",
          kurum: "Kurum rehberi",
          nereye: "Nereye gideceğim",
          paylas: "Paylaş ve hatırla",
        }[panel.tur];

  return (
    <PanelSaglayici value={panelAc}>
      <div className="ekran-icerik space-y-10">
        <header className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h1 className="font-serif text-3xl font-semibold leading-tight text-vurgu-koyu sm:text-4xl">Size özel listeniz</h1>
              <p className="mt-1 text-metin-ikincil">Vefat tarihi: {tarihMetni(cevaplar.vefat_tarihi as string)}</p>
              <p className="mt-3 max-w-xl">Her şeyi bugün yapmanız gerekmiyor. Sıradaki adıma odaklanın; son tarihleri biz takip ediyoruz.</p>
              <p className="mt-1 text-sm text-metin-ikincil">Bilgiler en son {tarihMetni(sonGuncelleme)} tarihinde güncellendi.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={listeyiYazdir} className="dugme dugme-ikincil min-h-11 px-4 py-2 text-base">
                Yazdır
              </button>
              <Link href="/liste" onClick={() => yaz(ANAHTARLAR.soruSirasi, "0")} className="dugme dugme-ikincil min-h-11 px-4 py-2 text-base">
                Cevaplarımı değiştir
              </Link>
            </div>
          </div>
          <Ilerleme biten={islemler.filter((a) => yapilanlar.has(a.id)).length} toplam={islemler.length} />
          {uyarilar.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => panelAc({ tur: "adim", id: u.id })}
              className="flex w-full items-start gap-3 rounded-xl border-l-4 border-uyari bg-uyari-acik px-4 py-3 text-left"
            >
              <span className="flex-1">
                <strong>{u.baslik}.</strong> <span className="text-metin-ikincil">Nedenini görmek için dokunun.</span>
              </span>
            </button>
          ))}
        </header>

        <OdakKarti
          adim={siradaki}
          sonYapilan={sonYapilan}
          onYaptim={(id) => {
            setSonYapilan(liste.adimlar.find((a) => a.id === id)?.baslik ?? null);
            isaretle(id, true);
          }}
        />

        <SonTarihKartlari adimlar={liste.sonTarihliler} yapilanlar={yapilanlar} />

        <Yolculuk
          donemler={donemler({ ...liste, adimlar: islemler }, yapilanlar)}
          simdiki={simdikiDonem(liste, yapilanlar)}
          liste={liste}
          yapilanlar={yapilanlar}
          onIsaret={isaretle}
        />

        <Dosyaniz
          ozet={{
            odeme: kalan("odeme"),
            risk: kalan("borc_risk"),
            belgeHazir: liste.belgeListesi.filter((b) => belgeDurumu.hazir.has(b.belge.id)).length,
            belgeToplam: liste.belgeListesi.length,
            kurum: liste.kurumlar.length,
            yer: yerler.filter((y) => y.adimlar.some((a) => !yapilanlar.has(a.id))).length,
          }}
        />

        <div className="yazdirma-gizle">
          <AracOnerileri oneriler={aracOnerileri(liste, yapilanlar)} />
        </div>

        {liste.avukatUyarilari.length > 0 && (
          <aside aria-label="Not" className="space-y-1 text-sm text-metin-ikincil">
            {liste.avukatUyarilari.map((u) => (
              <p key={u.id}>{u.metin}</p>
            ))}
          </aside>
        )}

        {oneri && (
          <div className="yazdirma-gizle">
            <PaketKarti paket={paket} riza={riza} oneri={oneri} />
          </div>
        )}

        {yapilanlar.size >= 2 && (
          <div className="yazdirma-gizle">
            <DeneyimKutusu />
          </div>
        )}

        {!oneri && EPOSTA_TOPLAMA_AKTIF && (
          <div className="yazdirma-gizle">
            <YakindaKutusu riza={riza} />
          </div>
        )}
      </div>

      <YazdirmaListesi icerik={icerik} liste={liste} yapilanlar={yapilanlar} cevaplar={cevaplar} />

      <Panel acik={!!panel} baslik={panelBasligi} onKapat={() => setPanel(null)}>
        {panel?.tur === "adim" && acikAdim && (
          <div className="space-y-6">
            <AdimDetay
              adim={acikAdim}
              belgeler={icerik.belgeler}
              kurumlar={liste.kurumlar}
              sozluk={icerik.sozluk}
              bekledikleri={bekledikleri(acikAdim, liste, yapilanlar)}
              hazir={belgeDurumu.hazir}
              turetilmis={belgeDurumu.turetilmis}
              onBelge={belgeIsaretle}
            />
            {acikAdim.yer !== "dikkat" && (
              <button
                type="button"
                onClick={() => {
                  const yeni = !yapilanlar.has(acikAdim.id);
                  isaretle(acikAdim.id, yeni);
                  if (yeni) setSonYapilan(acikAdim.baslik);
                  setPanel(null);
                }}
                className={`dugme w-full ${yapilanlar.has(acikAdim.id) ? "dugme-ikincil" : "dugme-birincil"}`}
              >
                {yapilanlar.has(acikAdim.id) ? (
                  "Yapılmadı olarak işaretle"
                ) : (
                  <>
                    <Tik className="size-5" /> Bu adımı yaptım
                  </>
                )}
              </button>
            )}
          </div>
        )}
        {panel?.tur === "odemeler" && (
          <div className="space-y-4">
            <p className="text-base text-metin-ikincil">Hak edebileceğiniz ödemeler. Birçok aile bunlardan habersiz; her birinin şartlarını ayrıntılarda bulabilirsiniz.</p>
            <KisaListe adimlar={liste.adimlar.filter((a) => a.kategori === "odeme")} bos="Cevaplarınıza göre gösterilecek bir ödeme yok." />
          </div>
        )}
        {panel?.tur === "riskler" && (
          <div className="space-y-4">
            <p className="text-base text-metin-ikincil">Borç olup olmadığını öğrenmenize ve beklenmedik ödemelerden korunmanıza yardım eden adımlar.</p>
            <KisaListe adimlar={liste.adimlar.filter((a) => a.kategori === "borc_risk")} bos="Cevaplarınıza göre gösterilecek bir adım yok." />
          </div>
        )}
        {panel?.tur === "belgeler" && (
          <BelgeKontrolListesi liste={liste.belgeListesi} hazir={belgeDurumu.hazir} turetilmis={belgeDurumu.turetilmis} onBelge={belgeIsaretle} />
        )}
        {panel?.tur === "kurum" && <KurumRehberi kurumlar={liste.kurumlar} belgeler={icerik.belgeler} acikId={panel.id} />}
        {panel?.tur === "nereye" && <NereyeGit yerler={yerler} yapilanlar={yapilanlar} />}
        {panel?.tur === "paylas" && <PaylasHatirla cevaplar={cevaplar} sonTarihliler={liste.sonTarihliler} />}
      </Panel>
    </PanelSaglayici>
  );
}

/** Yalnızca yazdırırken görünen tam liste: tüm adımlar ayrıntılarıyla ve belge listesi. */
function YazdirmaListesi({
  icerik,
  liste,
  yapilanlar,
  cevaplar,
}: {
  icerik: Icerik;
  liste: ReturnType<typeof listeOlustur>;
  yapilanlar: Set<string>;
  cevaplar: Cevaplar;
}) {
  return (
    <div className="yazdirma-listesi">
      <h1 className="font-serif text-2xl font-semibold">Vefat Rehberi: yapılacaklar listesi</h1>
      <p className="mb-6">Vefat tarihi: {tarihMetni(cevaplar.vefat_tarihi as string)}. Genel bilgilendirme amaçlıdır; son tarih ve tutarları resmi kaynaktan teyit edin.</p>
      {donemler(liste, yapilanlar).map((d) => (
        <section key={d.grup} className="mb-6">
          <h2 className="mb-2 font-serif text-xl font-semibold">{ZAMAN_ETIKETLERI[d.grup]}</h2>
          <ul className="space-y-4">
            {d.adimlar.map((a) => (
              <li key={a.id} className="border-b border-cizgi pb-4">
                <h3 className="mb-2 text-lg font-bold">
                  {yapilanlar.has(a.id) ? "☑" : "☐"} {a.baslik}
                </h3>
                <AdimDetay adim={a} belgeler={icerik.belgeler} kurumlar={liste.kurumlar} sozluk={[]} yazdirma hazir={hazirBelgeler(new Set(), liste, yapilanlar).hazir} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h2 className="mb-2 font-serif text-xl font-semibold">Belgeler</h2>
        <ul className="space-y-1">
          {liste.belgeListesi.map((b) => (
            <li key={b.belge.id}>
              ☐ {b.belge.ad}
              {b.belge.not && <span className="text-metin-ikincil">. {b.belge.not}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PaylasimKabul({ mevcutVar, onKabul, onVazgec }: { mevcutVar: boolean; onKabul: () => void; onVazgec: () => void }) {
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl font-semibold text-vurgu-koyu">Size bir liste paylaşıldı</h1>
      <p className="mt-3 text-lg">
        Bu bağlantı, bir yakınınızın cevaplarıyla oluşturulmuş yapılacaklar listesini açıyor. Bağlantı isim veya kimlik bilgisi içermez.
      </p>
      {mevcutVar && (
        <p className="mt-4 rounded-xl bg-altin-acik px-4 py-3 text-base">
          Bu cihazda kendi oluşturduğunuz bir liste var. Paylaşılan listeyi açarsanız kendi cevaplarınızın yerine geçer. &ldquo;Yaptım&rdquo; işaretleriniz silinmez.
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onKabul} className="dugme dugme-birincil">
          Paylaşılan listeyi aç
        </button>
        <button type="button" onClick={onVazgec} className="dugme dugme-ikincil">
          Vazgeç
        </button>
      </div>
    </div>
  );
}
