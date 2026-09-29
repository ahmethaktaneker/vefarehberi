"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CihazdaKalir } from "@/components/CihazdaKalir";
import { SonucuPaylas } from "@/components/SonucuPaylas";
import { olay } from "@/lib/analitik";
import { tutarOku } from "@/lib/hesaplayici";
import { olumAyligiPaylari, type CocukDurumu, type DigerEbeveyn, type EbeveynGeliri, type OlumCocuk, type OlumEbeveyn } from "@/lib/olumAyligi";

const kutu = "min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg";
const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tl = (n: number) => `${para.format(n)} TL`;
const yuzde = (n: number) => `%${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n * 100)}`;

const COCUK_DURUMLARI: [CocukDurumu, string][] = [
  ["yas", "18 yaşından küçük ya da öğrenci (lise 20, üniversite 25 yaşına kadar)"],
  ["kiz", "Kız; evli değil, boşanmış ya da dul (yaşı fark etmez)"],
  ["malul", "Çalışma gücünün en az %60'ını kaybetmiş (SGK raporlu)"],
  ["hicbiri", "Hiçbiri (evli kız, 25 yaşını geçmiş erkek vb.)"],
];

const DIGER_EBEVEYN: [DigerEbeveyn, string][] = [
  ["es", "Vefat edenin eşi; evliydiler ve yeniden evlenmedi"],
  ["vefat", "O da vefat etmiş"],
  ["evli_degil", "Vefat edenle evli değildi (boşanmış ya da hiç evlenmemiş)"],
  ["evlendi", "Vefat edenin eşiydi, sonradan başkasıyla evlendi"],
];

const GELIR: [EbeveynGeliri, string][] = [
  ["bilinmiyor", "Bilmiyorum"],
  ["dusuk", "Evet: geliri net asgari ücretten az ve kendi aylığı yok"],
  ["yuksek", "Hayır: geliri bundan fazla ya da kendi aylığı var"],
];

export function OlumAyligiHesaplayici() {
  const [sistem, setSistem] = useState<"5510" | "5434">("5510");
  const [aylikMetin, setAylikMetin] = useState("");
  const [esVar, setEsVar] = useState(true);
  const [esCalisiyor, setEsCalisiyor] = useState(false);
  const [cocuklar, setCocuklar] = useState<OlumCocuk[]>([]);
  const [anne, setAnne] = useState<OlumEbeveyn>({ ad: "Annesi", sag: false, gelir: "bilinmiyor", yas65Ustu: false });
  const [baba, setBaba] = useState<OlumEbeveyn>({ ad: "Babası", sag: false, gelir: "bilinmiyor", yas65Ustu: false });

  const aylik = tutarOku(aylikMetin);
  const sonuc = sistem === "5510" && aylik !== null && aylik > 0 ? olumAyligiPaylari({ aylik, esVar, esCalisiyor, cocuklar, anne, baba }) : null;

  const olculdu = useRef(false);
  useEffect(() => {
    if (sonuc && sonuc.satirlar.length > 0 && !olculdu.current) {
      olculdu.current = true;
      olay("hesaplayici_kullanildi");
    }
  }, [sonuc]);

  return (
    <div className="space-y-8">
      <form className="space-y-8 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <CihazdaKalir kutu>Buraya yazdıklarınızı biz görmüyoruz; yalnızca bu cihazda kalır.</CihazdaKalir>
        <div>
          <label htmlFor="sistem" className="block font-semibold">
            Vefat edenin aylığı hangi kurumdan?
          </label>
          <select id="sistem" value={sistem} onChange={(e) => setSistem(e.target.value as "5510" | "5434")} className={`${kutu} mt-2`}>
            <option value="5510">SSK ya da Bağ-Kur (2008 sonrası memurluk dahil)</option>
            <option value="5434">Emekli Sandığı (2008 öncesi memur)</option>
          </select>
          {sistem === "5434" && (
            <p className="mt-2 rounded-xl bg-vurgu-acik px-4 py-3 text-base">
              Emekli Sandığı (5434 sayılı Kanun) kapsamındaki aylıkların paylaşımı farklı kurallara bağlıdır; bu hesaplayıcı
              bu durumu kapsamaz. Hak sahiplerinin paylarını SGK&apos;ya ya da e-Devlet&apos;teki tahsis başvurusu sonucuna bakarak
              öğrenebilirsiniz.
            </p>
          )}
        </div>

        <div className="border-t border-cizgi pt-6">
          <label htmlFor="aylik" className="block font-semibold">
            Vefat edenin aylığı (TL)
          </label>
          <p id="aylik-a" className="text-base text-metin-ikincil">
            Emekliyse hesabına yatan aylık. Çalışıyorsa bu tutarı SGK hesaplar; bildiğiniz bir tutar varsa yazın.
          </p>
          <input
            id="aylik"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Örn. 18.000"
            value={aylikMetin}
            onChange={(e) => setAylikMetin(e.target.value)}
            aria-describedby="aylik-a"
            className={`${kutu} mt-2 max-w-xs`}
          />
          {aylikMetin !== "" && aylik === null && <p className="mt-1 text-base text-uyari">Yalnızca rakam yazın (ör. 18.000).</p>}
        </div>

        <div className="border-t border-cizgi pt-6">
        <fieldset className="space-y-3">
          <legend className="mb-2 font-semibold">Eşi</legend>
          <Onay etiket="Eşi hayatta ve yeniden evlenmedi" deger={esVar} onChange={setEsVar} />
          {esVar && <Onay etiket="Eşi sigortalı çalışıyor ya da kendi emekli maaşını alıyor" deger={esCalisiyor} onChange={setEsCalisiyor} />}
        </fieldset>
        </div>

        <div className="border-t border-cizgi pt-6">
        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">Çocukları</legend>
          <p className="text-base text-metin-ikincil">Evlatlıklar ve tanınmış çocuklar dahil, tüm çocukları ekleyin.</p>
          {cocuklar.map((c, i) => (
            <CocukKarti
              key={i}
              cocuk={c}
              esVar={esVar}
              onChange={(x) => setCocuklar(cocuklar.map((y, j) => (j === i ? x : y)))}
              onSil={() => setCocuklar(cocuklar.filter((_, j) => j !== i))}
            />
          ))}
          <button
            type="button"
            onClick={() => setCocuklar([...cocuklar, { ad: `${cocuklar.length + 1}. çocuk`, durum: "yas", calisiyor: false, digerEbeveyn: esVar ? "es" : "vefat" }])}
            className="dugme dugme-ikincil"
          >
            + Çocuk ekle
          </button>
        </fieldset>
        </div>

        <div className="border-t border-cizgi pt-6">
        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">Anne ve babası</legend>
          <EbeveynSatiri e={anne} onChange={setAnne} />
          <EbeveynSatiri e={baba} onChange={setBaba} />
        </fieldset>
        </div>
      </form>

      <section aria-live="polite" aria-labelledby="olum-sonuc" className="rounded-2xl border-t-4 border-altin bg-yuzey p-5 shadow-yuksek sm:p-6">
        <h2 id="olum-sonuc" className="font-serif text-xl font-semibold text-vurgu-koyu">
          Bağlanacak aylıklar
        </h2>
        {sistem === "5434" ? (
          <p className="mt-2 text-metin-ikincil">Emekli Sandığı aylıkları için bu hesaplayıcı sonuç göstermez.</p>
        ) : !sonuc ? (
          <p className="mt-2 text-metin-ikincil">Sonucu görmek için vefat edenin aylığını yazın.</p>
        ) : sonuc.satirlar.length === 0 ? (
          <p className="mt-2">Girdiğiniz bilgilere göre aylık bağlanacak hak sahibi görünmüyor.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-cizgi">
                  <th scope="col" className="py-2 pr-3">Kime</th>
                  <th scope="col" className="py-2 pr-3">Oran</th>
                  <th scope="col" className="py-2 text-right">Aylık</th>
                </tr>
              </thead>
              <tbody>
                {sonuc.satirlar.map((s) => (
                  <tr key={s.kim} className="border-b border-cizgi last:border-0">
                    <th scope="row" className="py-2 pr-3 font-normal">
                      {s.kim}
                    </th>
                    <td className="py-2 pr-3">{yuzde(s.oran)}</td>
                    <td className="py-2 text-right font-serif text-xl font-semibold text-vurgu-koyu">{tl(s.tutar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sonuc.indirimYapildi && (
              <p className="text-base">Paylar toplamı vefat edenin aylığını aştığı için hepsinden aynı oranda indirim yapıldı.</p>
            )}
            {sonuc.alamayanlar.length > 0 && <p className="text-base text-metin-ikincil">Aylık alamayanlar: {sonuc.alamayanlar.join(", ")}.</p>}
            {sonuc.belirsizler.length > 0 && (
              <p className="text-base text-metin-ikincil">
                {sonuc.belirsizler.join(" ve ")} için gelir durumu bilinmediğinden oran hesaplanmadı. Hak kazanırlarsa diğer
                payların oranı değişebilir.
              </p>
            )}
            <SonucuPaylas
              baslik="Ölüm aylığı paylaşımı"
              satirlar={sonuc.satirlar.map((s) => `${s.kim}: ${yuzde(s.oran)}, ${tl(s.tutar)}`)}
              yol="/hesaplayici/olum-ayligi"
            />
          </div>
        )}
      </section>

      <p className="text-sm text-metin-ikincil">
        Kesin tutarı SGK hesaplar. Girdiğiniz bilgiler hiçbir yere gönderilmez.
      </p>
    </div>
  );
}

function CocukKarti({ cocuk: c, esVar, onChange, onSil }: { cocuk: OlumCocuk; esVar: boolean; onChange: (c: OlumCocuk) => void; onSil: () => void }) {
  const id = useId();
  return (
    <div className="space-y-4 rounded-xl border border-cizgi p-4">
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={`${id}-ad`} className="sr-only">
          Çocuğun adı
        </label>
        <input
          id={`${id}-ad`}
          value={c.ad}
          onChange={(e) => onChange({ ...c, ad: e.target.value })}
          className="min-h-11 w-full max-w-64 rounded-lg border border-transparent bg-transparent px-2 font-semibold hover:border-cizgi focus:border-cizgi"
        />
        <button type="button" onClick={onSil} className="min-h-11 shrink-0 px-2 text-base text-uyari underline underline-offset-4">
          Sil<span className="sr-only">: {c.ad}</span>
        </button>
      </div>
      <div>
        <label htmlFor={`${id}-d`} className="block font-semibold">
          Durumu
        </label>
        <select id={`${id}-d`} value={c.durum} onChange={(e) => onChange({ ...c, durum: e.target.value as CocukDurumu })} className={`${kutu} mt-2`}>
          {COCUK_DURUMLARI.map(([k, ad]) => (
            <option key={k} value={k}>
              {ad}
            </option>
          ))}
        </select>
      </div>
      {c.durum !== "hicbiri" && (
        <div className="flex flex-col gap-3">
          <Onay etiket="Sigortalı çalışıyor ya da kendi aylığını alıyor" deger={c.calisiyor} onChange={(x) => onChange({ ...c, calisiyor: x })} />
        </div>
      )}
      {c.durum !== "hicbiri" && (
        <div>
          <label htmlFor={`${id}-e`} className="block font-semibold">
            Çocuğun diğer annesi ya da babası
          </label>
          <select
            id={`${id}-e`}
            value={c.digerEbeveyn}
            onChange={(e) => onChange({ ...c, digerEbeveyn: e.target.value as DigerEbeveyn })}
            className={`${kutu} mt-2`}
          >
            {DIGER_EBEVEYN.filter(([k]) => esVar || k !== "es").map(([k, ad]) => (
              <option key={k} value={k}>
                {ad}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function EbeveynSatiri({ e, onChange }: { e: OlumEbeveyn; onChange: (e: OlumEbeveyn) => void }) {
  return (
    <div className="space-y-3">
      <Onay etiket={`${e.ad} hayatta`} deger={e.sag} onChange={(x) => onChange({ ...e, sag: x })} />
      {e.sag && (
        <div className="ml-4 flex flex-col gap-3 border-l-2 border-cizgi pl-4">
          <Gelir e={e} onChange={onChange} />
          <Onay etiket="65 yaşından büyük" deger={e.yas65Ustu} onChange={(x) => onChange({ ...e, yas65Ustu: x })} />
        </div>
      )}
    </div>
  );
}

function Gelir({ e, onChange }: { e: OlumEbeveyn; onChange: (e: OlumEbeveyn) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        Geliri net asgari ücretten az ve kendi aylığı yok mu?
      </label>
      <select id={id} value={e.gelir} onChange={(x) => onChange({ ...e, gelir: x.target.value as EbeveynGeliri })} className={`${kutu} mt-2`}>
        {GELIR.map(([k, ad]) => (
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
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-cizgi px-4 py-2 has-[:checked]:border-vurgu-koyu has-[:checked]:bg-vurgu-acik">
      <input type="checkbox" checked={deger} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-vurgu-koyu" />
      {etiket}
    </label>
  );
}
