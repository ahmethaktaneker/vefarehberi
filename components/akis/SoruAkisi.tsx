"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { kaynakSayfa, olay } from "@/lib/analitik";
import { ANAHTARLAR, jsonCoz, tumunuSil, useDepo, yaz } from "@/lib/depo";
import { istanbulBugun, tarihGecerli } from "@/lib/kurallar/tarih";
import { akisTamam, cevaplandi, gorunenSorular, type Cevaplar, type Soru } from "@/lib/sorular";

export function SoruAkisi() {
  const router = useRouter();
  const hamCevaplar = useDepo(ANAHTARLAR.cevaplar);
  const hamSira = useDepo(ANAHTARLAR.soruSirasi);
  const cevaplar = useMemo(() => jsonCoz<Cevaplar>(hamCevaplar, {}), [hamCevaplar]);
  const baslikRef = useRef<HTMLHeadingElement>(null);

  const sorular = gorunenSorular(cevaplar);
  const sira = Math.min(Math.max(Number(hamSira) || 0, 0), sorular.length - 1);
  const soru = sorular[sira];

  useEffect(() => {
    // Soru değişince ekran okuyucular yeni soruyu duysun.
    if (sira > 0) baslikRef.current?.focus();
  }, [sira]);

  if (hamCevaplar === undefined) {
    return <p className="text-metin-ikincil">Yükleniyor…</p>;
  }

  if (akisTamam(cevaplar) && hamSira === null) {
    return (
      <HazirPaneli
        onGozdenGecir={() => {
          yaz(ANAHTARLAR.soruSirasi, "0");
        }}
      />
    );
  }

  function cevapYaz(yeni: Cevaplar) {
    yaz(ANAHTARLAR.cevaplar, JSON.stringify(yeni));
  }

  function ilerle(yeni: Cevaplar) {
    const yeniSorular = gorunenSorular(yeni);
    const simdiki = yeniSorular.findIndex((s) => s.id === soru.id);
    if (simdiki === 0) {
      try {
        sessionStorage.setItem("vefa:akis-baslangic", String(Date.now()));
      } catch {}
      olay("akis_basladi", { kaynak: kaynakSayfa() });
    }
    olay("soru_cevaplandi", { soru_no: simdiki + 1 });
    if (simdiki + 1 >= yeniSorular.length) {
      try {
        const bas = Number(sessionStorage.getItem("vefa:akis-baslangic"));
        if (bas) olay("akis_tamamlandi", { sure_sn: Math.round((Date.now() - bas) / 1000) });
      } catch {}
      yaz(ANAHTARLAR.soruSirasi, null);
      router.push("/liste/sonuc");
    } else {
      yaz(ANAHTARLAR.soruSirasi, String(simdiki + 1));
    }
  }

  function geri() {
    yaz(ANAHTARLAR.soruSirasi, String(sira - 1));
  }

  const ilerleme = Math.round(((sira + 1) / sorular.length) * 100);

  return (
    <div>
      {sira === 0 && <p className="mb-6 text-lg text-metin-ikincil">Başınız sağ olsun.</p>}

      <div className="mb-8">
        <p className="mb-2 text-base text-metin-ikincil">
          Soru {sira + 1} / {sorular.length}
        </p>
        <div
          role="progressbar"
          aria-label="İlerleme"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ilerleme}
          className="h-2 overflow-hidden rounded-full bg-cizgi"
        >
          <div className="h-full rounded-full bg-vurgu transition-[width]" style={{ width: `${ilerleme}%` }} />
        </div>
      </div>

      <fieldset key={soru.id}>
        <legend className="contents">
          <h1 ref={baslikRef} tabIndex={-1} className="font-serif text-2xl font-semibold leading-snug outline-none sm:text-3xl">
            {soru.soru}
          </h1>
        </legend>
        {soru.aciklama && <p className="mt-2 text-base text-metin-ikincil">{soru.aciklama}</p>}

        <div className="mt-6">
          {soru.tip === "tarih" ? (
            <TarihSorusu soru={soru} cevaplar={cevaplar} cevapYaz={cevapYaz} ilerle={ilerle} />
          ) : soru.tip === "tek" ? (
            <TekSecim soru={soru} cevaplar={cevaplar} sec={(v) => {
              const yeni = { ...cevaplar, [soru.id]: v };
              cevapYaz(yeni);
              ilerle(yeni);
            }} />
          ) : (
            <CokluSecim soru={soru} cevaplar={cevaplar} cevapYaz={cevapYaz} ilerle={ilerle} />
          )}
        </div>
      </fieldset>

      {soru.tip !== "tarih" && soru.secenekler.some((s) => s.deger === "bilmiyorum") && (
        <p className="mt-6 text-base text-metin-ikincil">
          &ldquo;Bilmiyorum&rdquo; da geçerli bir cevap. Listenize bunu nasıl öğrenebileceğinizi ekleriz.
        </p>
      )}

      <div className="mt-10">
        {sira > 0 ? (
          <button
            type="button"
            onClick={geri}
            className="dugme dugme-ikincil"
          >
            <span aria-hidden="true">←&nbsp;</span>Önceki soru
          </button>
        ) : (
          <Link
            href="/"
            className="dugme dugme-ikincil"
          >
            <span aria-hidden="true">←&nbsp;</span>Ana sayfa
          </Link>
        )}
      </div>
    </div>
  );
}

type SecimliSoru = Extract<Soru, { tip: "tek" | "coklu" }>;

const secenekSinifi = (secili: boolean) =>
  `flex min-h-14 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-lg transition-colors ${
    secili ? "border-vurgu bg-vurgu-acik" : "border-cizgi bg-yuzey hover:border-vurgu"
  }`;

function TekSecim({ soru, cevaplar, sec }: { soru: SecimliSoru; cevaplar: Cevaplar; sec: (v: string) => void }) {
  return (
    <ul className="space-y-3">
      {soru.secenekler.map((s) => {
        const secili = cevaplar[soru.id] === s.deger;
        return (
          <li key={s.deger}>
            <button type="button" aria-pressed={secili} onClick={() => sec(s.deger)} className={secenekSinifi(secili)}>
              {s.etiket}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CokluSecim({
  soru,
  cevaplar,
  cevapYaz,
  ilerle,
}: {
  soru: SecimliSoru;
  cevaplar: Cevaplar;
  cevapYaz: (c: Cevaplar) => void;
  ilerle: (c: Cevaplar) => void;
}) {
  const secililer = (cevaplar[soru.id] as string[] | undefined) ?? [];

  function degistir(deger: string, isaretli: boolean) {
    const tekBasina = soru.secenekler.find((s) => s.deger === deger)?.tekBasina;
    const tekBasinalar = soru.secenekler.filter((s) => s.tekBasina).map((s) => s.deger);
    let yeni: string[];
    if (!isaretli) yeni = secililer.filter((v) => v !== deger);
    else if (tekBasina) yeni = [deger];
    else yeni = [...secililer.filter((v) => !tekBasinalar.includes(v)), deger];
    cevapYaz({ ...cevaplar, [soru.id]: yeni });
  }

  return (
    <>
      <ul className="space-y-3">
        {soru.secenekler.map((s) => {
          const secili = secililer.includes(s.deger);
          return (
            <li key={s.deger}>
              <label className={`${secenekSinifi(secili)} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={secili}
                  onChange={(e) => degistir(s.deger, e.target.checked)}
                  className="size-5 shrink-0 accent-vurgu"
                />
                {s.etiket}
              </label>
            </li>
          );
        })}
      </ul>
      <DevamDugmesi etkin={cevaplandi(soru, cevaplar)} onClick={() => ilerle(cevaplar)} />
    </>
  );
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/**
 * Vefat tarihi: gün, ay ve yıl için üç ayrı büyük liste. Telefonların tarih seçicisi ve
 * "gg.aa.yyyy" yazımı birçok kullanıcı için zor; listeler her cihazda aynı ve anlaşılır çalışır.
 */
function TarihSorusu({
  soru,
  cevaplar,
  cevapYaz,
  ilerle,
}: {
  soru: Soru;
  cevaplar: Cevaplar;
  cevapYaz: (c: Cevaplar) => void;
  ilerle: (c: Cevaplar) => void;
}) {
  const bugun = istanbulBugun();
  const kayitli = typeof cevaplar[soru.id] === "string" ? (cevaplar[soru.id] as string) : "";
  const [parca, setParca] = useState(() => {
    const [y = "", m = "", d = ""] = tarihGecerli(kayitli) ? kayitli.split("-") : [];
    return { gun: d ? String(Number(d)) : "", ay: m ? String(Number(m)) : "", yil: y };
  });
  const buYil = Number(bugun.slice(0, 4));
  const yillar = Array.from({ length: 21 }, (_, i) => String(buYil - i));

  const tarih =
    parca.gun && parca.ay && parca.yil
      ? `${parca.yil}-${parca.ay.padStart(2, "0")}-${parca.gun.padStart(2, "0")}`
      : "";
  const tamam = tarih !== "";
  const gecersizGun = tamam && !tarihGecerli(tarih);
  const gelecekte = tamam && !gecersizGun && tarih > bugun;
  const gecerli = tamam && !gecersizGun && !gelecekte;

  function degistir(alan: "gun" | "ay" | "yil", deger: string) {
    const p = { ...parca, [alan]: deger };
    setParca(p);
    const t = p.gun && p.ay && p.yil ? `${p.yil}-${p.ay.padStart(2, "0")}-${p.gun.padStart(2, "0")}` : "";
    cevapYaz({ ...cevaplar, [soru.id]: tarihGecerli(t) && t <= bugun ? t : "" });
  }

  const liste = "min-h-14 w-full rounded-lg border border-cizgi bg-yuzey px-2 text-lg";
  const hata = gecersizGun ? "Bu ayda bu gün yok. Lütfen günü kontrol edin." : gelecekte ? "Vefat tarihi bugünden sonra olamaz." : "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (gecerli) ilerle({ ...cevaplar, [soru.id]: tarih });
      }}
    >
      <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-3 sm:max-w-md">
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Gün</span>
          <select value={parca.gun} onChange={(e) => degistir("gun", e.target.value)} className={liste} aria-invalid={!!hata || undefined} aria-describedby={hata ? "tarih-hata" : undefined}>
            <option value="">–</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Ay</span>
          <select value={parca.ay} onChange={(e) => degistir("ay", e.target.value)} className={liste}>
            <option value="">–</option>
            {AYLAR.map((ad, i) => (
              <option key={ad} value={String(i + 1)}>
                {ad}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Yıl</span>
          <select value={parca.yil} onChange={(e) => degistir("yil", e.target.value)} className={liste}>
            <option value="">–</option>
            {yillar.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      {hata && (
        <p id="tarih-hata" role="alert" className="mt-3 text-base text-uyari">
          {hata}
        </p>
      )}
      <DevamDugmesi etkin={gecerli} tip="submit" />
    </form>
  );
}

function DevamDugmesi({ etkin, onClick, tip = "button" }: { etkin: boolean; onClick?: () => void; tip?: "button" | "submit" }) {
  return (
    <button
      type={tip}
      disabled={!etkin}
      onClick={onClick}
      className="mt-6 dugme dugme-birincil disabled:cursor-not-allowed disabled:bg-cizgi disabled:text-metin-ikincil"
    >
      Devam
    </button>
  );
}

function HazirPaneli({ onGozdenGecir }: { onGozdenGecir: () => void }) {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Listeniz hazır</h1>
      <p className="mt-3 text-metin-ikincil">Daha önce verdiğiniz cevaplar bu cihazda kayıtlı.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/liste/sonuc"
          className="dugme dugme-birincil"
        >
          Listemi gör
        </Link>
        <button
          type="button"
          onClick={onGozdenGecir}
          className="dugme dugme-ikincil"
        >
          Cevaplarımı değiştir
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Bu cihazdaki tüm cevaplarınız ve işaretleriniz silinecek. Emin misiniz?")) tumunuSil();
        }}
        className="mt-8 text-base text-metin-ikincil underline underline-offset-4"
      >
        Baştan başla (cevaplarımı sil)
      </button>
    </div>
  );
}
