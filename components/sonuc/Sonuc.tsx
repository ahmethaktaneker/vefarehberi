"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ANAHTARLAR, jsonCoz, useDepo, yaz } from "@/lib/depo";
import type { Icerik, ZamanGrubu } from "@/lib/icerik/sema";
import { listeOlustur, type HesaplanmisAdim } from "@/lib/kurallar/liste";
import { istanbulBugun, tarihMetni } from "@/lib/kurallar/tarih";
import { akisTamam, type Cevaplar } from "@/lib/sorular";
import { AdimKarti, kartaGit, TutarSatiri } from "@/components/sonuc/AdimKarti";
import { BelgeListesi, KurumRehberi } from "@/components/sonuc/KurumRehberi";

const ZAMAN_ETIKETLERI: Record<ZamanGrubu, string> = {
  ilk_hafta: "İlk hafta",
  ilk_ay: "İlk ay",
  ilk_3_ay: "İlk 3 ay",
  ilk_4_ay: "İlk 4 ay",
  sonra: "Sonra (acelesi olmayanlar)",
};

export function Sonuc({ icerik }: { icerik: Icerik }) {
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const hamYapilanlar = useDepo(ANAHTARLAR.yapilanlar);
  const cevaplar = useMemo(() => jsonCoz<Cevaplar>(hamCevaplar, {}), [hamCevaplar]);
  const yapilanlar = useMemo(() => new Set(jsonCoz<string[]>(hamYapilanlar, [])), [hamYapilanlar]);
  const bugun = istanbulBugun();
  const liste = useMemo(() => listeOlustur(cevaplar, icerik, bugun), [cevaplar, icerik, bugun]);

  if (hamCevaplar === undefined) return <p className="text-metin-ikincil">Yükleniyor…</p>;

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
    if (yapildi) yeni.add(id);
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
        <p className="mt-3 text-metin-ikincil">
          Vefat tarihi: {tarihMetni(cevaplar.vefat_tarihi as string)} ·{" "}
          <Link
            href="/liste"
            onClick={() => yaz(ANAHTARLAR.soruSirasi, "0")}
            className="text-vurgu-koyu underline underline-offset-4"
          >
            Cevaplarımı değiştir
          </Link>
        </p>
        <p className="mt-3 text-base text-metin-ikincil">
          &ldquo;Kontrol ediliyor&rdquo; etiketli bilgiler henüz hukuk uzmanı kontrolünden geçmedi.
          Son tarih ve tutarları resmi kaynaktan teyit edin.
        </p>
      </header>

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
            return (
              <section key={grup} aria-labelledby={`grup-${grup}`}>
                <h3 id={`grup-${grup}`} className="mb-4 text-lg font-semibold text-metin-ikincil">
                  {ZAMAN_ETIKETLERI[grup]}
                </h3>
                <ul className="space-y-3">
                  {adimlar.map((a) => (
                    <AdimKarti
                      key={a.id}
                      adim={a}
                      belgeler={icerik.belgeler}
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
          Listenizdeki adımlarda istenen belgelerin tamamı. Her kurum farklı belge isteyebilir; gitmeden önce teyit edin.
        </p>
        <BelgeListesi liste={liste.belgeListesi} />
      </Bolum>
    </div>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  const id = `bolum-${baslik.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-4 font-serif text-2xl font-semibold">
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
        className="text-lg font-semibold text-metin underline underline-offset-4"
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
        <li key={a.id} className="px-4 py-3">
          <a
            href={`#adim-${a.id}`}
            onClick={() => kartaGit(a.id)}
            className="font-semibold text-vurgu-koyu underline underline-offset-4"
          >
            {a.baslik}
          </a>
          {a.tutarBilgisi && <TutarSatiri bilgi={a.tutarBilgisi} />}
          {a.belirsiz && (
            <p className="mt-1 text-base text-metin-ikincil">Durumunuza göre geçerli olabilir.</p>
          )}
        </li>
      ))}
    </ul>
  );
}
