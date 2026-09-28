"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { olay } from "@/lib/analitik";
import { KONTROL_ROZETLERI } from "@/lib/marka";
import type { Paket } from "@/lib/paket";
import { paketTetikleyici } from "@/lib/paketTetikleyici";
import { PaketKarti } from "@/components/sonuc/PaketKarti";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import type { Icerik, ZamanGrubu } from "@/lib/icerik/sema";
import { listeOlustur, type HesaplanmisAdim } from "@/lib/kurallar/liste";
import { istanbulBugun, tarihMetni } from "@/lib/kurallar/tarih";
import { PAYLASIM_ANAHTARI, paylasimCoz, paylasimKodla } from "@/lib/paylasim";
import { akisTamam, gecerliCevaplar, type Cevaplar } from "@/lib/sorular";
import { AdimKarti, kartaGit, TutarSatiri } from "@/components/sonuc/AdimKarti";
import { KurumRehberi } from "@/components/sonuc/KurumRehberi";
import { BelgeKontrolListesi } from "@/components/sonuc/BelgeKontrolListesi";
import { PaylasHatirla } from "@/components/sonuc/PaylasHatirla";

function hashAbone(f: () => void) {
  window.addEventListener("hashchange", f);
  return () => window.removeEventListener("hashchange", f);
}

function hashTemizle() {
  window.history.replaceState(null, "", window.location.pathname);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

const ZAMAN_ETIKETLERI: Record<ZamanGrubu, string> = {
  ilk_hafta: "İlk hafta",
  ilk_ay: "İlk ay",
  ilk_3_ay: "İlk 3 ay",
  ilk_4_ay: "İlk 4 ay",
  sonra: "Sonra (acelesi olmayanlar)",
};

export function Sonuc({ icerik, paket, riza }: { icerik: Icerik; paket: Paket; riza: { surum: string; metin: string } }) {
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const hamYapilanlar = useDepo(ANAHTARLAR.yapilanlar);
  const cevaplar = useMemo(() => jsonCoz<Cevaplar>(hamCevaplar, {}), [hamCevaplar]);
  const yapilanlar = useMemo(() => new Set(jsonCoz<string[]>(hamYapilanlar, [])), [hamYapilanlar]);
  const bugun = istanbulBugun();
  const liste = useMemo(() => listeOlustur(cevaplar, icerik, bugun), [cevaplar, icerik, bugun]);
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
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Listeniz henüz hazır değil</h1>
        <p className="mt-3">Listenizi oluşturmak için önce birkaç soruyu cevaplayın.</p>
        <Link
          href="/liste"
          className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-vurgu px-7 py-3 text-lg font-semibold text-white hover:bg-vurgu-koyu"
        >
          Sorulara git
        </Link>
      </div>
    );
  }

  function yapildiDegistir(id: string, yapildi: boolean) {
    const yeni = new Set(yapilanlar);
    if (yapildi) {
      yeni.add(id);
      olay("adim_isaretlendi", { adim_id: id });
    }
    else yeni.delete(id);
    yaz(ANAHTARLAR.yapilanlar, JSON.stringify([...yeni]));
  }

  const odemeler = liste.adimlar.filter((a) => a.kategori === "odeme");
  const riskler = liste.adimlar.filter((a) => a.kategori === "borc_risk");
  const yapilanSayisi = liste.adimlar.filter((a) => yapilanlar.has(a.id)).length;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-serif text-3xl font-semibold leading-tight">Size özel listeniz</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-metin-ikincil">Vefat tarihi: {tarihMetni(cevaplar.vefat_tarihi as string)}</p>
          <Link
            href="/liste"
            onClick={() => yaz(ANAHTARLAR.soruSirasi, "0")}
            className="yazdirma-gizle inline-flex min-h-11 items-center rounded-lg border border-cizgi bg-yuzey px-4 text-base font-semibold text-vurgu-koyu hover:border-vurgu"
          >
            Cevaplarımı değiştir
          </Link>
        </div>
        <Ozet liste={liste} yapilanlar={yapilanlar} />
        <p className="mt-4 text-base text-metin-ikincil">
          {KONTROL_ROZETLERI && <>&ldquo;Kontrol ediliyor&rdquo; etiketli bilgiler henüz hukuk uzmanı kontrolünden geçmedi. </>}
          Bu liste genel bilgilendirme amaçlıdır. Son tarih ve tutarları resmi kaynaktan teyit edin.
        </p>
      </header>

      <Icindekiler kurumVar={liste.kurumlar.length > 0} />

      <Bolum baslik="Kritik son tarihler">
        {liste.sonTarihliler.length === 0 ? (
          <p>
            Cevaplarınıza göre bu bölümde gösterilecek bir son tarih yok. Durumunuz değişirse (ör. borç
            olduğunu öğrenirseniz) cevaplarınızı güncelleyin.
          </p>
        ) : (
          <ul className="space-y-3">
            {liste.sonTarihliler.map((a) => (
              <SonTarihKutusu key={a.id} adim={a} />
            ))}
          </ul>
        )}
      </Bolum>

      {liste.avukatUyarilari.length > 0 && (
        <section aria-labelledby="avukat-baslik" className="rounded-lg border border-cizgi bg-bilgi-acik p-5">
          <h2 id="avukat-baslik" className="font-serif text-xl font-semibold">
            Bir avukata danışmanız önerilir
          </h2>
          <ul className="mt-3 space-y-2">
            {liste.avukatUyarilari.map((u) => (
              <li key={u.id}>{u.metin}</li>
            ))}
          </ul>
        </section>
      )}

      <Bolum baslik="Size çıkabilecek ödemeler">
        <OzetListesi adimlar={odemeler} bos="Cevaplarınıza göre bu bölümde gösterilecek bir ödeme yok." />
      </Bolum>

      <Bolum baslik="Borç ve risk kontrolü">
        <OzetListesi adimlar={riskler} bos="Cevaplarınıza göre bu bölümde gösterilecek bir adım yok." />
      </Bolum>

      <Bolum baslik="Adım adım liste">
        <p className="-mt-2 mb-6 text-base text-metin-ikincil" aria-live="polite">
          {liste.adimlar.length} adımdan {yapilanSayisi} tanesini yaptınız. İşaretleriniz yalnızca bu cihazda saklanır.
        </p>
        <div className="space-y-10">
          {(Object.keys(ZAMAN_ETIKETLERI) as ZamanGrubu[]).map((grup) => {
            const adimlar = liste.adimlar.filter((a) => a.zaman_grubu === grup);
            if (adimlar.length === 0) return null;
            const biten = adimlar.filter((a) => yapilanlar.has(a.id)).length;
            return (
              <section key={grup} aria-labelledby={`grup-${grup}`}>
                <h3 id={`grup-${grup}`} className="mb-4 flex items-baseline justify-between gap-3 border-b border-cizgi pb-2">
                  <span className="font-serif text-xl font-semibold">{ZAMAN_ETIKETLERI[grup]}</span>
                  <span className="text-base text-metin-ikincil">
                    {biten} / {adimlar.length} yapıldı
                  </span>
                </h3>
                <ul className="space-y-3">
                  {adimlar.map((a) => (
                    <AdimKarti
                      key={a.id}
                      adim={a}
                      belgeler={icerik.belgeler}
                      kurumlar={liste.kurumlar}
                      sozluk={icerik.sozluk}
                      yapildi={yapilanlar.has(a.id)}
                      onYapildi={(v) => yapildiDegistir(a.id, v)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Bolum>

      {liste.kurumlar.length > 0 && (
        <Bolum baslik="Kurum rehberi">
          <KurumRehberi kurumlar={liste.kurumlar} belgeler={icerik.belgeler} />
        </Bolum>
      )}

      <Bolum baslik="Belge listesi">
        <p className="-mt-2 mb-4 text-base text-metin-ikincil">
          Listenizdeki adımlarda istenen belgelerin tamamı, en çok gerekenden başlayarak. Hazırladıklarınızı
          işaretleyin; her kurum farklı belge isteyebilir, gitmeden önce teyit edin.
        </p>
        <BelgeKontrolListesi liste={liste.belgeListesi} />
      </Bolum>

      <Bolum baslik="Paylaş ve hatırla">
        <PaylasHatirla cevaplar={cevaplar} sonTarihliler={liste.sonTarihliler} />
      </Bolum>

      <div className="yazdirma-gizle">
        <PaketKarti paket={paket} riza={riza} tetikleyici={paketTetikleyici(paket, cevaplar, liste)} />
      </div>
    </div>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(([g]) => {
      if (g.isIntersecting) {
        olay("bolum_goruntulendi", { bolum: baslik });
        gozlemci.disconnect();
      }
    });
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [baslik]);
  const id = `bolum-${baslik.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9]+/g, "-")}`;
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-baslik`} className="scroll-mt-20">
      <h2 id={`${id}-baslik`} className="mb-4 font-serif text-2xl font-semibold">
        {baslik}
      </h2>
      {children}
    </section>
  );
}

function kalanMetni(kalan: number): string {
  if (kalan > 1) return `${kalan} gün kaldı`;
  if (kalan === 1) return "1 gün kaldı";
  return "Bugün son gün";
}

function SonTarihKutusu({ adim }: { adim: HesaplanmisAdim }) {
  const b = adim.sonTarihBilgisi!;
  const st = adim.son_tarih!;
  return (
    <li className={`rounded-lg border-2 p-4 ${b.gecti ? "border-dashed border-uyari bg-yuzey" : "border-uyari bg-uyari-acik"}`}>
      <a
        href={`#adim-${adim.id}`}
        onClick={() => kartaGit(adim.id)}
        className="inline-flex min-h-11 items-center text-lg font-semibold text-metin underline underline-offset-4"
      >
        {adim.baslik}
      </a>
      <p className="mt-1">
        Son tarih: <strong>{tarihMetni(b.tarih)}</strong>
        {" · "}
        <strong className="text-uyari">{b.gecti ? "Süre geçmiş görünüyor" : kalanMetni(b.kalanGun)}</strong>
      </p>
      {b.gecti && <p className="mt-2">{st.gecti_notu}</p>}
      {st.not && <p className="mt-2 text-base text-metin-ikincil">{st.not}</p>}
      {b.belirsizNot && <p className="mt-2 text-base text-metin-ikincil">{b.belirsizNot}</p>}
    </li>
  );
}

function OzetListesi({ adimlar, bos }: { adimlar: HesaplanmisAdim[]; bos: string }) {
  if (adimlar.length === 0) return <p>{bos}</p>;
  return (
    <ul className="divide-y divide-cizgi rounded-lg border border-cizgi bg-yuzey">
      {adimlar.map((a) => (
        <li key={a.id}>
          <a
            href={`#adim-${a.id}`}
            onClick={() => kartaGit(a.id)}
            className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-zemin"
          >
            <span className="flex-1">
              <span className="block font-semibold text-vurgu-koyu">{a.baslik}</span>
              {a.tutarBilgisi && <TutarSatiri bilgi={a.tutarBilgisi} />}
              {a.belirsiz && <span className="mt-1 block text-base text-metin-ikincil">Durumunuza göre geçerli olabilir.</span>}
            </span>
            <span aria-hidden="true" className="text-vurgu-koyu">→</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function PaylasimKabul({ mevcutVar, onKabul, onVazgec }: { mevcutVar: boolean; onKabul: () => void; onVazgec: () => void }) {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Size bir liste paylaşıldı</h1>
      <p className="mt-3">
        Bu bağlantı, bir yakınınızın cevaplarıyla oluşturulmuş yapılacaklar listesini açıyor. Bağlantı isim veya
        kimlik bilgisi içermez.
      </p>
      {mevcutVar && (
        <p className="mt-3 rounded-md bg-bilgi-acik px-3 py-2 text-base">
          Bu cihazda kendi oluşturduğunuz bir liste var. Paylaşılan listeyi açarsanız kendi cevaplarınızın yerine
          geçer. &ldquo;Yaptım&rdquo; işaretleriniz silinmez.
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onKabul}
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-vurgu px-7 py-3 text-lg font-semibold text-white hover:bg-vurgu-koyu"
        >
          Paylaşılan listeyi aç
        </button>
        <button
          type="button"
          onClick={onVazgec}
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-cizgi bg-yuzey px-7 py-3 text-lg font-semibold text-vurgu-koyu hover:border-vurgu"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

const ICINDEKILER: [string, string][] = [
  ["Son tarihler", "kritik-son-tarihler"],
  ["Ödemeler", "size-çıkabilecek-ödemeler"],
  ["Borç ve risk", "borç-ve-risk-kontrolü"],
  ["Adımlar", "adım-adım-liste"],
  ["Kurumlar", "kurum-rehberi"],
  ["Belgeler", "belge-listesi"],
  ["Paylaş", "paylaş-ve-hatırla"],
];

function Icindekiler({ kurumVar }: { kurumVar: boolean }) {
  return (
    <nav
      aria-label="Bu sayfada"
      className="yazdirma-gizle sticky top-0 z-10 -mx-4 border-b border-cizgi bg-zemin/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {ICINDEKILER.filter(([, id]) => kurumVar || id !== "kurum-rehberi").map(([ad, id]) => (
          <li key={id}>
            <a
              href={`#bolum-${id}`}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-cizgi bg-yuzey px-4 text-base text-vurgu-koyu hover:border-vurgu"
            >
              {ad}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}


function Ozet({ liste, yapilanlar }: { liste: ReturnType<typeof listeOlustur>; yapilanlar: Set<string> }) {
  const toplam = liste.adimlar.length;
  const biten = liste.adimlar.filter((a) => yapilanlar.has(a.id)).length;
  const yuzde = toplam ? Math.round((biten / toplam) * 100) : 0;
  const enYakin = liste.sonTarihliler.find((a) => !a.sonTarihBilgisi!.gecti && !yapilanlar.has(a.id));
  // Sıradaki adımlar: önce yaklaşan son tarihler, sonra listedeki sıra
  const sonTarihIdleri = liste.sonTarihliler.filter((a) => !a.sonTarihBilgisi!.gecti).map((a) => a.id);
  const siradakiler = [
    ...sonTarihIdleri.map((id) => liste.adimlar.find((a) => a.id === id)!),
    ...liste.adimlar.filter((a) => !sonTarihIdleri.includes(a.id)),
  ]
    .filter((a) => !yapilanlar.has(a.id))
    .slice(0, 3);

  return (
    <section aria-labelledby="ozet-baslik" className="mt-6 rounded-lg border border-cizgi bg-yuzey p-5">
      <h2 id="ozet-baslik" className="sr-only">
        Özet
      </h2>
      <p className="text-lg">
        <strong>{toplam} adımdan {biten} tanesi</strong> yapıldı.
      </p>
      <div
        role="progressbar"
        aria-label="Yapılan adımlar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={yuzde}
        className="mt-2 h-3 overflow-hidden rounded-full bg-cizgi"
      >
        <div className="h-full rounded-full bg-vurgu" style={{ width: `${yuzde}%` }} />
      </div>
      {enYakin && (
        <p className="mt-4 text-lg">
          En yakın son tarih:{" "}
          <strong className="text-uyari">
            {tarihMetni(enYakin.sonTarihBilgisi!.tarih)} ({kalanMetni(enYakin.sonTarihBilgisi!.kalanGun).toLocaleLowerCase("tr")})
          </strong>
          <br />
          <span className="text-base text-metin-ikincil">{enYakin.baslik}</span>
        </p>
      )}
      {siradakiler.length > 0 ? (
        <>
          <h3 className="mt-5 text-lg font-semibold">Sıradaki adımlar</h3>
          <ol className="mt-2 space-y-2">
            {siradakiler.map((a, i) => (
              <li key={a.id}>
                <a
                  href={`#adim-${a.id}`}
                  onClick={() => kartaGit(a.id)}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-cizgi px-3 py-2 hover:border-vurgu"
                >
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-vurgu-acik font-semibold text-vurgu-koyu">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-base">{a.baslik}</span>
                  <span aria-hidden="true" className="text-vurgu-koyu">→</span>
                </a>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="mt-4 text-lg">Listenizdeki tüm adımları işaretlediniz.</p>
      )}
    </section>
  );
}
