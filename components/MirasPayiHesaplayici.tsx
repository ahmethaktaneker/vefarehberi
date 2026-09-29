"use client";

import Link from "next/link";
import { CihazdaKalir } from "@/components/CihazdaKalir";
import { useEffect, useId, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import { aracGorunur } from "@/lib/araclar";
import { mirasPaylari, ortakPaydayla, yuzde, type BuyukKol, type Kardes, type KardesTuru, type Kisi } from "@/lib/mirasPayi";

const kutu = "min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg";
const yuzdeBicim = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

const KARDES_TURLERI: [KardesTuru, string][] = [
  ["tam", "Anne ve baba bir"],
  ["anne_bir", "Yalnızca anne bir"],
  ["baba_bir", "Yalnızca baba bir"],
];

export function MirasPayiHesaplayici() {
  const [esSag, setEsSag] = useState<boolean | null>(null);
  const [cocuklar, setCocuklar] = useState<Kisi[]>([]);
  const [anneSag, setAnneSag] = useState(false);
  const [babaSag, setBabaSag] = useState(false);
  const [kardesler, setKardesler] = useState<Kardes[]>([]);
  const [anneKolu, setAnneKolu] = useState<BuyukKol>({ buyukanneSag: false, buyukbabaSag: false, cocuklar: [] });
  const [babaKolu, setBabaKolu] = useState<BuyukKol>({ buyukanneSag: false, buyukbabaSag: false, cocuklar: [] });
  const [uveyVar, setUveyVar] = useState(false);

  const altsoyVar = cocuklar.some((c) => c.sag || c.cocukSayisi > 0);
  const ikinciZumreVar = anneSag || babaSag || kardesler.some((k) => k.sag || k.cocukSayisi > 0);
  const girdi = {
    esSag: !!esSag,
    cocuklar,
    anneSag,
    babaSag,
    kardesler: altsoyVar ? [] : kardesler,
    buyukler: { anne: anneKolu, baba: babaKolu },
    uveyVar,
  };
  const sonuc = esSag === null ? null : mirasPaylari(altsoyVar ? { ...girdi, anneSag: false, babaSag: false } : girdi);

  const olculdu = useRef(false);
  useEffect(() => {
    if (sonuc?.durum === "tamam" && !olculdu.current) {
      olculdu.current = true;
      olay("hesaplayici_kullanildi");
    }
  }, [sonuc]);

  return (
    <div className="space-y-8">
      <form className="space-y-8 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <CihazdaKalir kutu>Buraya yazdıklarınızı biz görmüyoruz; yalnızca bu cihazda kalır.</CihazdaKalir>
        <fieldset>
          <legend className="font-semibold">Vefat edenin eşi hayatta mı?</legend>
          <p className="text-base text-metin-ikincil">Boşanmış eş mirasçı olmaz.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {[
              [true, "Evet"],
              [false, "Hayır / evli değildi"],
            ].map(([d, ad]) => (
              <label key={String(d)} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-cizgi px-4 has-[:checked]:border-vurgu-koyu has-[:checked]:bg-vurgu-acik">
                <input type="radio" name="es" checked={esSag === d} onChange={() => setEsSag(d as boolean)} className="size-5 accent-vurgu-koyu" />
                {ad}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-semibold">Çocukları</legend>
          <p className="text-base text-metin-ikincil">
            Evlatlıklar ve tanınmış evlilik dışı çocuklar da dahil. Vefat edenden önce ölmüş çocukları da ekleyin; onların payı
            kendi çocuklarına geçer.
          </p>
          {cocuklar.map((c, i) => (
            <KisiKarti
              key={i}
              baslik={`${i + 1}. çocuk`}
              kisi={c}
              cocukEtiketi="Hayattaki çocuklarının (torunların) sayısı"
              onChange={(k) => setCocuklar(cocuklar.map((x, j) => (j === i ? k : x)))}
              onSil={() => setCocuklar(cocuklar.filter((_, j) => j !== i))}
            />
          ))}
          <button type="button" onClick={() => setCocuklar([...cocuklar, { ad: `${cocuklar.length + 1}. çocuk`, sag: true, cocukSayisi: 0 }])} className="dugme dugme-ikincil">
            + Çocuk ekle
          </button>
        </fieldset>

        {!altsoyVar && (
          <div className="border-t border-cizgi pt-6">
          <fieldset className="space-y-4">
            <legend className="mb-2 font-semibold">Çocuğu ya da torunu yoksa: anne, baba ve kardeşler</legend>
            <div className="flex flex-wrap gap-3">
              <Onay etiket="Annesi hayatta" deger={anneSag} onChange={setAnneSag} />
              <Onay etiket="Babası hayatta" deger={babaSag} onChange={setBabaSag} />
            </div>
            <p className="text-base text-metin-ikincil">
              Anne ya da baba vefat etmişse, onun payı vefat edenin kardeşlerine geçer. Kardeşleri, vefat etmiş olanlar dahil ekleyin.
            </p>
            {kardesler.map((k, i) => (
              <KisiKarti
                key={i}
                baslik={`${i + 1}. kardeş`}
                kisi={k}
                cocukEtiketi="Hayattaki çocuklarının (yeğenlerin) sayısı"
                onChange={(x) => setKardesler(kardesler.map((y, j) => (j === i ? { ...y, ...x } : y)))}
                onSil={() => setKardesler(kardesler.filter((_, j) => j !== i))}
              >
                <Secim
                  etiket="Kardeşlik"
                  deger={k.tur}
                  secenekler={KARDES_TURLERI}
                  onChange={(t) => setKardesler(kardesler.map((y, j) => (j === i ? { ...y, tur: t as KardesTuru } : y)))}
                />
              </KisiKarti>
            ))}
            <button
              type="button"
              onClick={() => setKardesler([...kardesler, { ad: `${kardesler.length + 1}. kardeş`, sag: true, cocukSayisi: 0, tur: "tam" }])}
              className="dugme dugme-ikincil"
            >
              + Kardeş ekle
            </button>
          </fieldset>
          </div>
        )}

        {!altsoyVar && !ikinciZumreVar && (
          <div className="border-t border-cizgi pt-6">
            <fieldset className="space-y-6">
              <legend className="mb-2 font-semibold">Anne, baba ve kardeş de yoksa: büyükanne ve büyükbabalar</legend>
              <p className="text-base text-metin-ikincil">
                Vefat etmiş büyüklerin payı kendi çocuklarına (amca, hala, dayı, teyze) geçer.
                {esSag ? " Eş hayatta olduğu için kuzenler mirasçı olmaz." : " Onlar da vefat etmişse çocuklarına (kuzenlere) geçer."}
              </p>
              <BuyukKolu
                baslik="Anne tarafı"
                buyukanne="Anneannesi"
                buyukbaba="Anne tarafından dedesi"
                cocukAdi="dayı / teyze"
                kol={anneKolu}
                esSag={!!esSag}
                onChange={setAnneKolu}
              />
              <BuyukKolu
                baslik="Baba tarafı"
                buyukanne="Babaannesi"
                buyukbaba="Baba tarafından dedesi"
                cocukAdi="amca / hala"
                kol={babaKolu}
                esSag={!!esSag}
                onChange={setBabaKolu}
              />
              <Onay
                etiket="Yalnızca büyükanneden ya da yalnızca büyükbabadan olan (üvey) amca, hala, dayı ya da teyze var"
                deger={uveyVar}
                onChange={setUveyVar}
              />
            </fieldset>
          </div>
        )}
      </form>

      <section aria-live="polite" aria-labelledby="miras-sonuc">
        <h2 id="miras-sonuc" className="font-serif text-2xl font-semibold text-vurgu-koyu">
          Paylar
        </h2>
        {sonuc === null && <p className="mt-2 text-base text-metin-ikincil">Önce eşin hayatta olup olmadığını seçin.</p>}
        {sonuc?.durum === "tamam" && (
          <>
            <div className="mt-3 overflow-x-auto rounded-2xl bg-yuzey shadow-kart">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-cizgi">
                    <th scope="col" className="px-4 py-3">Mirasçı</th>
                    <th scope="col" className="px-4 py-3">Payı</th>
                    <th scope="col" className="px-4 py-3 text-right">Yüzde</th>
                  </tr>
                </thead>
                <tbody>
                  {sonuc.satirlar.map((s) => (
                    <tr key={s.kim} className="border-b border-cizgi last:border-0">
                      <th scope="row" className="px-4 py-3 font-normal">
                        {s.kim}
                        {s.kim !== s.yakinlik && s.yakinlik !== "Çocuğu" && <span className="block text-base text-metin-ikincil">{s.yakinlik}</span>}
                      </th>
                      <td className="px-4 py-3 font-semibold">{ortakPaydayla(s.pay, sonuc.ortakPayda)}</td>
                      <td className="px-4 py-3 text-right">%{yuzdeBicim.format(yuzde(s.pay))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-base text-metin-ikincil">
              {sonuc.zumre === 1
                ? "Çocuk veya torun olduğu için anne, baba ve kardeşler mirasçı olmaz."
                : sonuc.zumre === 2
                  ? "Çocuk veya torun olmadığı için miras anne-baba tarafına geçer."
                  : sonuc.zumre === 3
                    ? "Çocuk, anne, baba ve kardeş olmadığı için miras büyükanne ve büyükbaba tarafına geçer."
                    : "Mirasçı olacak başka akraba olmadığı için miras eşe, eş de yoksa Devlete kalır (TMK m.499, 501)."}{" "}
              Mirası reddeden olursa paylar değişir.
            </p>
            <p className="mt-2 text-sm text-metin-ikincil">
              Vasiyet yoksa geçerli olan yasal paylardır; resmi paylar mirasçılık belgesinde yazar. Girdiğiniz bilgiler hiçbir yere
              gönderilmez.
            </p>
            {aracGorunur("beyanname_araci") && (
              <p className="mt-3">
                <Link href="/beyanname" className="baglanti">
                  Bu paylarla veraset beyannamesini doldurun
                </Link>
              </p>
            )}
          </>
        )}
        {sonuc?.durum === "kapsam_disi" && (
          <p className="mt-3 rounded-xl bg-vurgu-acik px-4 py-3 text-base">
            Üvey amca, hala, dayı ya da teyze olduğunda paylar kimin çocuğu olduklarına göre değişir; bu durumu hesaplayamıyoruz.
            Mirasçılık belgesi alırken noter ya da mahkeme belirler.
            {sonuc.esPayi && " Eşin payı dörtte üçtür (%75)."}
          </p>
        )}
      </section>
    </div>
  );
}

function KisiKarti({
  baslik,
  kisi,
  cocukEtiketi,
  onChange,
  onSil,
  children,
}: {
  baslik: string;
  kisi: Kisi;
  cocukEtiketi: string;
  onChange: (k: Kisi) => void;
  onSil: () => void;
  children?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-4 rounded-xl border border-cizgi p-4">
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={`${id}-ad`} className="sr-only">
          {baslik} adı
        </label>
        <input
          id={`${id}-ad`}
          value={kisi.ad}
          onChange={(e) => onChange({ ...kisi, ad: e.target.value })}
          className="min-h-11 w-full max-w-64 rounded-lg border border-transparent bg-transparent px-2 font-semibold hover:border-cizgi focus:border-cizgi"
        />
        <button type="button" onClick={onSil} className="min-h-11 shrink-0 px-2 text-base text-uyari underline underline-offset-4">
          Sil<span className="sr-only">: {kisi.ad}</span>
        </button>
      </div>
      {children}
      <Secim
        etiket="Durumu"
        deger={kisi.sag ? "sag" : "vefat"}
        secenekler={[
          ["sag", "Hayatta"],
          ["vefat", "Vefat edenden önce ölmüş"],
        ]}
        onChange={(d) => onChange({ ...kisi, sag: d === "sag" })}
      />
      {!kisi.sag && cocukEtiketi && (
        <div>
          <label htmlFor={`${id}-cs`} className="block font-semibold">
            {cocukEtiketi}
          </label>
          <input
            id={`${id}-cs`}
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            value={kisi.cocukSayisi}
            onChange={(e) => onChange({ ...kisi, cocukSayisi: Math.max(0, Math.min(20, Math.floor(Number(e.target.value) || 0))) })}
            className={`${kutu} mt-2 max-w-40`}
          />
        </div>
      )}
    </div>
  );
}

function BuyukKolu({
  baslik,
  buyukanne,
  buyukbaba,
  cocukAdi,
  kol,
  esSag,
  onChange,
}: {
  baslik: string;
  buyukanne: string;
  buyukbaba: string;
  cocukAdi: string;
  kol: BuyukKol;
  esSag: boolean;
  onChange: (k: BuyukKol) => void;
}) {
  const oluVar = !kol.buyukanneSag || !kol.buyukbabaSag;
  return (
    <div className="space-y-4 rounded-xl border border-cizgi p-4">
      <h3 className="font-semibold">{baslik}</h3>
      <div className="flex flex-wrap gap-3">
        <Onay etiket={`${buyukanne} hayatta`} deger={kol.buyukanneSag} onChange={(x) => onChange({ ...kol, buyukanneSag: x })} />
        <Onay etiket={`${buyukbaba} hayatta`} deger={kol.buyukbabaSag} onChange={(x) => onChange({ ...kol, buyukbabaSag: x })} />
      </div>
      {oluVar && (
        <>
          <p className="text-base text-metin-ikincil">Vefat etmiş olanlar dahil tüm {cocukAdi} ekleyin.</p>
          {kol.cocuklar.map((c, i) => (
            <KisiKarti
              key={i}
              baslik={c.ad}
              kisi={c}
              cocukEtiketi={esSag ? "" : "Hayattaki çocuklarının (kuzenlerin) sayısı"}
              onChange={(k) => onChange({ ...kol, cocuklar: kol.cocuklar.map((x, j) => (j === i ? k : x)) })}
              onSil={() => onChange({ ...kol, cocuklar: kol.cocuklar.filter((_, j) => j !== i) })}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...kol, cocuklar: [...kol.cocuklar, { ad: `${kol.cocuklar.length + 1}. ${cocukAdi}`, sag: true, cocukSayisi: 0 }] })}
            className="dugme dugme-ikincil"
          >
            + {cocukAdi[0].toUpperCase() + cocukAdi.slice(1)} ekle
          </button>
        </>
      )}
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

function Onay({ etiket, deger, onChange }: { etiket: string; deger: boolean; onChange: (x: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-cizgi px-4 has-[:checked]:border-vurgu-koyu has-[:checked]:bg-vurgu-acik">
      <input type="checkbox" checked={deger} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-vurgu-koyu" />
      {etiket}
    </label>
  );
}
