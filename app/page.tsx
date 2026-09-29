import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdMetni } from "@/lib/jsonld";
import { DevamKarti } from "@/components/DevamKarti";
import { ARAC_TANIMLARI, aracGorunur, type AracId } from "@/lib/araclar";
import { hazirSayfa } from "@/lib/icerik/sayfalar";
import { icerikYukle } from "@/lib/icerik/yukle";
import { AVUKAT_ROZETI_AKTIF, ILETISIM_EPOSTA, SITE_URL, URUN_ADI } from "@/lib/marka";
import { yorumlariYukle } from "@/lib/yorumlar";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Google'ın site adını ve yayıncıyı doğru göstermesi için; yalnızca sayfada görünen bilgiler. */
const YAPILANDIRILMIS = [
  { "@context": "https://schema.org", "@type": "WebSite", name: URUN_ADI, url: SITE_URL, inLanguage: "tr" },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: URUN_ADI,
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    email: ILETISIM_EPOSTA,
  },
];

/** Ana sayfadaki araçlar, süresi en yakın işten başlayarak. */
const ANA_SAYFA_ARACLARI: AracId[] = ["reddi_miras_tablosu", "beyanname_araci", "miras_payi", "olum_ayligi", "veraset_hesaplayici"];

/** Ana sayfadan bağlantı verilen rehberler: ailelerin en çok aradığı konular. */
const ANA_SAYFA_REHBERLERI = [
  { href: "/rehber/vefat-sonrasi-yapilacak-islemler", slug: "rehber/vefat-sonrasi-yapilacak-islemler" },
  { href: "/ilk-48-saat", slug: "ilk-48-saat" },
  { href: "/rehber/mirascilik-belgesi-nasil-alinir", slug: "rehber/mirascilik-belgesi-nasil-alinir" },
  { href: "/rehber/reddi-miras-suresi", slug: "rehber/reddi-miras-suresi" },
  { href: "/rehber/cenaze-odenegi", slug: "rehber/cenaze-odenegi" },
  { href: "/rehber/olum-ayligi-basvurusu", slug: "rehber/olum-ayligi-basvurusu" },
  { href: "/rehber/vefat-edenin-banka-hesaplari", slug: "rehber/vefat-edenin-banka-hesaplari" },
  { href: "/yurtdisi", slug: "yurtdisi" },
];

export default function AnaSayfa() {
  const { sureler, cenaze_odenegi } = icerikYukle().parametreler;
  const yorumlar = yorumlariYukle();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(YAPILANDIRILMIS) }} />
      {/* Giriş: sayfanın tek hareketli anı, yolun çizilmesi */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#e6ecf4_0%,#f3f1ec_100%)]">
        <GirisYolu />
        <div className="relative mx-auto max-w-4xl px-4 pt-10 pb-14 sm:px-6 sm:pt-16 sm:pb-20">
          <DevamKarti />
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl font-semibold leading-[1.15] text-vurgu-koyu sm:text-5xl">
              Yakınınızı kaybettiniz. Sırada ne var, birlikte bakalım.
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-metin">
              Vefat sonrası işlemler bu günlerde çok gelebilir. Birkaç soruya cevap verin; neyi, ne zaman ve nereye giderek yapacağınızı sırasıyla gösterelim.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link href="/liste" className="dugme dugme-birincil px-8 text-lg">
                Listemi oluştur
              </Link>
              <p className="text-base text-metin-ikincil">11 kısa soru, yaklaşık 3 dakika. Ücretsiz.</p>
            </div>
          </div>
          <ul className="mt-10 grid gap-3 text-base sm:grid-cols-3">
            {AVUKAT_ROZETI_AKTIF && <Guvence>Avukat ve mali müşavir desteğiyle hazırlanır</Guvence>}
            <Guvence>İsim, T.C. kimlik numarası gibi bilgiler istemez; cevaplarınız cihazınızda kalır</Guvence>
            <Guvence>
              Her bilginin kaynağı ve son kontrol tarihi yazılı.{" "}
              <Link href="/hakkimizda" className="baglanti">
                Kim hazırlıyor?
              </Link>
            </Guvence>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-16 px-4 pt-14 sm:px-6">
        {/* Gerçek bir sıra: numaralar bilgi taşıyor */}
        <section aria-labelledby="nasil-baslik">
          <h2 id="nasil-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu sm:text-3xl">
            Nasıl çalışır
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            <Adim no={1} baslik="Kısa sorulara cevap verin">
              Vefat tarihi, mal varlığı ve abonelikler gibi. İsim sormuyoruz; emin olmadığınızda &ldquo;Bilmiyorum&rdquo; demeniz yeterli.
            </Adim>
            <Adim no={2} baslik="Size özel listeniz çıksın">
              Son tarihler, çıkabilecek ödemeler, borç uyarıları ve gidilecek kurumlar, sizin durumunuza göre.
            </Adim>
            <Adim no={3} baslik="Adım adım ilerleyin">
              Sayfa her seferinde sıradaki tek adımı gösterir. Yaptıklarınızı işaretleyin, aileyle paylaşın, takviminize ekleyin.
            </Adim>
          </ol>
        </section>

        {/* Konuya özgü: vefattan itibaren işleyen gerçek süreler */}
        <section aria-labelledby="sureler-baslik">
          <h2 id="sureler-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu sm:text-3xl">
            Bazı işlerin süresi vefat tarihinden itibaren işler
          </h2>
          <p className="mt-2 max-w-2xl text-metin-ikincil">
            Bu tarihleri akılda tutmanıza gerek yok: listeniz hepsini sizin için hesaplar ve her açtığınızda kaç gün kaldığını gösterir.
          </p>
          <ol className="relative mt-8 grid gap-6 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:border-l-2 before:border-dashed before:border-altin sm:grid-cols-3 sm:gap-4 sm:before:hidden">
            <span aria-hidden="true" className="absolute top-3 right-0 left-0 hidden border-t-2 border-dashed border-altin sm:block" />
            <SureDuragi zaman="Vefat" baslik="Ölüm belgesi, cenaze ve ilk günler" ilk />
            <SureDuragi zaman={`${sureler.reddi_miras_ay}. ay`} baslik="Mirası reddetme süresi biter" aciklama="Borç olabileceğini düşünüyorsanız bu süre önemli." kirmizi />
            <SureDuragi
              zaman={`${sureler.veraset_beyanname_ay_tr}. ay`}
              baslik="Veraset beyannamesi süresi biter"
              aciklama={`Türkiye'deki mirasçılar için. Yurtdışında yaşayanlar için ${sureler.veraset_beyanname_ay_yurtdisi} ay.`}
              kirmizi
            />
          </ol>
          <p className="mt-6 text-base text-metin-ikincil">
            Hak edebileceğiniz ödemelerin de süresi var: örneğin cenaze ödeneği için {cenaze_odenegi.zamanasimi_yil} yıllık zamanaşımı bulunuyor.
          </p>
        </section>

        <section aria-labelledby="araclar-baslik">
          <h2 id="araclar-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu sm:text-3xl">
            Ücretsiz araçlar
          </h2>
          <p className="mt-2 max-w-2xl text-metin-ikincil">Listenizdeki adımlarda da karşınıza çıkarlar; doğrudan açmak isterseniz buradalar.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ANA_SAYFA_ARACLARI.filter(aracGorunur).map((id) => (
              <AracKarti key={id} href={ARAC_TANIMLARI[id].href} baslik={ARAC_TANIMLARI[id].ad}>
                {ARAC_TANIMLARI[id].aciklama}
              </AracKarti>
            ))}
            <AracKarti href="/sablonlar" baslik="Dilekçe taslakları">
              Banka, abonelik ve mirası reddetme dilekçelerini doldurup yazdırın.
            </AracKarti>
          </div>
          <h3 className="mt-10 text-lg font-bold text-vurgu-koyu">Sık sorulan konularda rehberler</h3>
          <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
            {ANA_SAYFA_REHBERLERI.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="baglanti inline-block py-2">
                  {hazirSayfa(r.slug).baslik}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rehber" className="baglanti inline-block py-2 font-bold">
                Tüm rehberler
              </Link>
            </li>
          </ul>
        </section>

        {yorumlar.length > 0 && (
          <section aria-labelledby="yorumlar-baslik">
            <h2 id="yorumlar-baslik" className="font-serif text-2xl font-semibold text-vurgu-koyu sm:text-3xl">
              Kullananlar ne diyor
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {yorumlar.map((y) => (
                <li key={y.metin}>
                  <figure className="h-full rounded-2xl border-l-4 border-altin bg-yuzey p-5 shadow-kart">
                    {y.puan && (
                      <p className="mb-2 text-lg tracking-wider text-altin" aria-label={`5 üzerinden ${y.puan} puan`}>
                        {"★".repeat(y.puan)}
                        <span className="text-cizgi">{"★".repeat(5 - y.puan)}</span>
                      </p>
                    )}
                    <blockquote className="font-serif text-lg leading-relaxed">&ldquo;{y.metin}&rdquo;</blockquote>
                    <figcaption className="mt-3 text-base text-metin-ikincil">{y.kim}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="son-cagri-baslik" className="rounded-2xl bg-vurgu p-6 text-white shadow-yuksek sm:p-8">
          <h2 id="son-cagri-baslik" className="font-serif text-2xl font-semibold sm:text-3xl">
            Neyi, ne zaman yapacağınızı birlikte sıralayalım
          </h2>
          <p className="mt-2 text-lg text-white/90">11 kısa soru, yaklaşık 3 dakika. Ücretsiz.</p>
          <Link href="/liste" className="dugme mt-6 bg-altin px-8 text-lg text-vurgu-koyu hover:bg-[#d6b574]">
            Listemi oluştur
          </Link>
        </section>
      </div>
    </>
  );
}

function GirisYolu() {
  return (
    <svg aria-hidden="true" viewBox="0 0 520 360" className="pointer-events-none absolute -right-24 -bottom-10 w-[34rem] opacity-60 sm:-right-10 sm:bottom-0 sm:opacity-100">
      <path
        className="yol-ciz"
        d="M20 330 C 140 320, 150 220, 260 210 S 400 110, 500 30"
        fill="none"
        stroke="#c9a45c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="330" r="9" fill="#c9a45c" />
      <circle cx="260" cy="210" r="9" fill="#1f3d63" />
      <circle cx="500" cy="30" r="9" fill="none" stroke="#1f3d63" strokeWidth="4" />
    </svg>
  );
}

function Guvence({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-xl bg-yuzey/80 p-3 shadow-kart">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-vurgu">
        <path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function SureDuragi({ zaman, baslik, aciklama, ilk, kirmizi }: { zaman: string; baslik: string; aciklama?: string; ilk?: boolean; kirmizi?: boolean }) {
  return (
    <li className="relative flex gap-4 sm:block">
      <span
        aria-hidden="true"
        className={`relative z-10 mt-0.5 block size-6 shrink-0 rounded-full border-4 border-zemin ${ilk ? "bg-altin" : kirmizi ? "bg-uyari" : "bg-vurgu"}`}
      />
      <span className="block sm:mt-3">
        <span className={`block font-serif text-2xl font-semibold ${kirmizi ? "text-uyari" : "text-vurgu-koyu"}`}>{zaman}</span>
        <span className="mt-1 block font-bold">{baslik}</span>
        {aciklama && <span className="mt-1 block text-base text-metin-ikincil">{aciklama}</span>}
      </span>
    </li>
  );
}

function Adim({ no, baslik, children }: { no: number; baslik: string; children: React.ReactNode }) {
  return (
    <li className="rounded-2xl bg-yuzey p-5 shadow-kart">
      <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-vurgu font-serif text-lg font-semibold text-white">
        {no}
      </span>
      <h3 className="mt-4 text-lg font-bold text-vurgu-koyu">{baslik}</h3>
      <p className="mt-1 text-base text-metin-ikincil">{children}</p>
    </li>
  );
}

function AracKarti({ href, baslik, children }: { href: string; baslik: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-cizgi bg-yuzey p-5 shadow-kart transition-shadow hover:shadow-yuksek">
      <span className="block text-lg font-bold text-vurgu underline decoration-transparent underline-offset-4 group-hover:decoration-vurgu">{baslik}</span>
      <span className="mt-1 block text-base text-metin-ikincil">{children}</span>
    </Link>
  );
}
