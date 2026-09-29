"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ANAHTARLAR, jsonCoz, useDepo } from "@/lib/depo";
import type { Icerik, Kurum, KurumTuru } from "@/lib/icerik/sema";
import { hazirBelgeler } from "@/lib/kurallar/ilerleme";
import { listeOlustur } from "@/lib/kurallar/liste";
import { istanbulBugun } from "@/lib/kurallar/tarih";
import { akisTamam, type Cevaplar } from "@/lib/sorular";

/** Gişede söylenecek cümle: kurumun türüne göre, kullanıcının kendi ağzından. */
const SOYLENECEK: Record<KurumTuru, string> = {
  operator: "Vefat eden yakınımın adına kayıtlı hattı kapatmak ya da üzerime almak istiyorum. Mirasçılık belgesi yanımda.",
  banka: "Vefat eden yakınımın hesaplarını, kredi ve kart borçlarını öğrenmek, mirasçı olarak işlem yapmak istiyorum. Mirasçılık belgesi yanımda.",
  enerji: "Vefat eden yakınımın elektrik aboneliğini kapatmak ya da üzerime almak ve güvence bedelini almak istiyorum.",
  dogalgaz: "Vefat eden yakınımın doğalgaz aboneliğini kapatmak ya da üzerime almak ve güvence bedelini almak istiyorum.",
  su: "Vefat eden yakınımın su aboneliğini kapatmak ya da üzerime almak ve güvence bedelini almak istiyorum.",
  dijital: "Vefat eden yakınımın hesabını kapatmak istiyorum.",
  diger: "Vefat eden yakınımın adına kayıtlı işlemleri sonlandırmak istiyorum.",
};

const SABLON_ADLARI: Record<string, string> = {
  banka_bakiye_yazisi: "Bankadan bakiye yazısı talebi",
  abonelik_iptal: "Abonelik iptali ve güvence bedeli iadesi talebi",
  otomatik_odeme_iptal: "Otomatik ödeme talimatlarının iptali talebi",
};

type Sayfa = { kurum: Kurum; belgeler: { id: string; ad: string; hazir: boolean }[]; sablonlar: string[] };

function yazdir() {
  document.body.classList.add("yazdir-form");
  const temizle = () => {
    document.body.classList.remove("yazdir-form");
    window.removeEventListener("afterprint", temizle);
  };
  window.addEventListener("afterprint", temizle);
  window.print();
}

export function KurumZiyaretSayfalari({ icerik }: { icerik: Icerik }) {
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const hamYapilanlar = useDepo(ANAHTARLAR.yapilanlar);
  const hamBelgeler = useDepo(ANAHTARLAR.belgeler);
  const [secilmeyen, setSecilmeyen] = useState<Set<string>>(new Set());

  const sayfalar = useMemo((): Sayfa[] | null => {
    if (hamCevaplar === undefined) return null;
    const cevaplar = jsonCoz<Cevaplar>(hamCevaplar, {});
    if (!akisTamam(cevaplar)) return [];
    const liste = listeOlustur(cevaplar, icerik, istanbulBugun());
    const yapilanlar = new Set(jsonCoz<string[]>(hamYapilanlar, []));
    const { hazir } = hazirBelgeler(new Set(jsonCoz<string[]>(hamBelgeler, [])), liste, yapilanlar);
    return liste.kurumlar.map((k) => {
      const adimlar = liste.adimlar.filter((a) => a.kurum_turleri.includes(k.tur) && !yapilanlar.has(a.id));
      const ids = new Set(["kimlik", ...k.islemler.flatMap((i) => i.belgeler), ...adimlar.flatMap((a) => a.belgeler)]);
      const belgeler = [...ids].filter((id) => icerik.belgeler[id]).map((id) => ({ id, ad: icerik.belgeler[id].ad, hazir: hazir.has(id) }));
      return { kurum: k, belgeler, sablonlar: [...new Set(adimlar.flatMap((a) => a.sablonlar))] };
    });
  }, [hamCevaplar, hamYapilanlar, hamBelgeler, icerik]);

  if (sayfalar === null) return <p className="text-base text-metin-ikincil">Yükleniyor…</p>;
  if (sayfalar.length === 0) {
    return (
      <p className="rounded-2xl bg-yuzey p-5 shadow-kart">
        Önce <Link href="/liste" className="baglanti">size özel listenizi</Link> oluşturun; gideceğiniz kurumlar ona göre çıkar.
      </p>
    );
  }
  const yazdirilacak = sayfalar.filter((s) => !secilmeyen.has(s.kurum.id));

  return (
    <>
      <div className="ekran-icerik space-y-6">
        <p className="text-lg">
          Gideceğiniz her kurum için tek sayfa: yanınıza alacaklarınız, gişede ne diyeceğiniz ve gerekirse dilekçe. Yazdırıp çantanıza
          koyun.
        </p>
        <ul className="space-y-4">
          {sayfalar.map((s) => (
            <li key={s.kurum.id} className="rounded-2xl bg-yuzey p-5 shadow-kart">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={!secilmeyen.has(s.kurum.id)}
                  onChange={(e) => {
                    const y = new Set(secilmeyen);
                    if (e.target.checked) y.delete(s.kurum.id);
                    else y.add(s.kurum.id);
                    setSecilmeyen(y);
                  }}
                  className="mt-1 size-6 shrink-0 accent-vurgu-koyu"
                />
                <span>
                  <span className="block font-serif text-xl font-semibold text-vurgu-koyu">{s.kurum.ad}</span>
                  {s.kurum.bolge && <span className="block text-base text-metin-ikincil">{s.kurum.bolge}</span>}
                </span>
              </label>
              <KurumIcerigi sayfa={s} />
            </li>
          ))}
        </ul>
        <button type="button" onClick={yazdir} disabled={yazdirilacak.length === 0} className="dugme dugme-birincil disabled:opacity-60">
          Seçili {yazdirilacak.length} sayfayı yazdır
        </button>
      </div>

      <div className="form-yazdirma">
        {yazdirilacak.map((s) => (
          <section key={s.kurum.id} className="resmi-form-sayfa space-y-4 bg-white text-[12pt] text-black">
            <p className="text-[18pt] font-bold">{s.kurum.ad}</p>
            {s.kurum.bolge && <p>{s.kurum.bolge}</p>}
            <KurumIcerigi sayfa={s} yazdirma />
            <p className="pt-4 text-[9pt]">Vefat Rehberi ile hazırlandı.</p>
          </section>
        ))}
      </div>
    </>
  );
}

function KurumIcerigi({ sayfa: { kurum: k, belgeler, sablonlar }, yazdirma }: { sayfa: Sayfa; yazdirma?: boolean }) {
  const kanallar = [...new Set(k.islemler.flatMap((i) => i.kanal))];
  const notlar = k.islemler.flatMap((i) => i.notlar_resmi);
  return (
    <div className={yazdirma ? "space-y-4" : "mt-4 space-y-4 text-base"}>
      <div>
        <p className="font-semibold">Yanınıza alın</p>
        <ul className="mt-1 space-y-1">
          {belgeler.map((b) => (
            <li key={b.id}>
              {b.hazir ? "☑" : "☐"} {b.ad}
            </li>
          ))}
          {sablonlar.map((s) => (
            <li key={s}>
              ☐ Dilekçe: {SABLON_ADLARI[s] ?? s}
              {!yazdirma && (
                <>
                  {" "}
                  <Link href={`/sablonlar/${s}`} className="baglanti">
                    doldur
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-semibold">Gişede şöyle diyebilirsiniz</p>
        <p className={yazdirma ? "border-l-4 border-black pl-3" : "mt-1 border-l-4 border-altin pl-3"}>&ldquo;{SOYLENECEK[k.tur]}&rdquo;</p>
      </div>
      {(kanallar.length > 0 || k.iletisim) && (
        <div>
          <p className="font-semibold">Nereye</p>
          {kanallar.length > 0 && <p>{kanallar.join(", ")}</p>}
          {k.iletisim && <p>{k.iletisim}</p>}
        </div>
      )}
      {notlar.length > 0 && (
        <div>
          <p className="font-semibold">Bilmeniz gerekenler</p>
          <ul className="list-disc space-y-1 pl-5">
            {notlar.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      {k.guvence_bedeli_iadesi.length > 0 && (
        <div>
          <p className="font-semibold">Güvence bedeli</p>
          <ul className="list-disc space-y-1 pl-5">
            {k.guvence_bedeli_iadesi.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
