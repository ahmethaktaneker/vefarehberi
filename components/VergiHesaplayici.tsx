"use client";

import { useEffect, useRef, useState } from "react";
import { olay } from "@/lib/analitik";
import type { Parametreler } from "@/lib/icerik/sema";
import { tutarOku, verasetVergisiHesapla, type MirasciTuru } from "@/lib/hesaplayici";

const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tl = (n: number) => `${para.format(n)} TL`;
const yuzde = (n: number) => `%${(n * 100).toLocaleString("tr-TR")}`;

const kutu = "min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg";

export function VergiHesaplayici({ parametreler }: { parametreler: Parametreler }) {
  const [toplamMetin, setToplamMetin] = useState("");
  const [yakinlik, setYakinlik] = useState<"cocuk" | "es" | "diger">("cocuk");
  const [cocukVar, setCocukVar] = useState(true);
  const [payYontemi, setPayYontemi] = useState<"biliyorum" | "esit">("esit");
  const [payMetin, setPayMetin] = useState("");
  const [mirasciMetin, setMirasciMetin] = useState("");

  const toplam = tutarOku(toplamMetin);
  const oran =
    payYontemi === "biliyorum"
      ? (() => {
          const y = Number(payMetin.replace(",", "."));
          return y > 0 && y <= 100 ? y / 100 : null;
        })()
      : (() => {
          const n = Number(mirasciMetin);
          return Number.isInteger(n) && n >= 1 && n <= 50 ? 1 / n : null;
        })();

  const tur: MirasciTuru = yakinlik === "es" ? (cocukVar ? "es_cocuklu" : "es_cocuksuz") : yakinlik;
  const sonuc = toplam !== null && oran !== null ? verasetVergisiHesapla(toplam * oran, tur, parametreler) : null;
  const olculdu = useRef(false);
  useEffect(() => {
    if (sonuc && !olculdu.current) {
      olculdu.current = true;
      olay("hesaplayici_kullanildi");
    }
  }, [sonuc]);

  return (
    <div className="space-y-8">
      <div role="note" className="rounded-xl border-l-4 border-altin bg-altin-acik px-4 py-3 text-base">
        Bu bir tahmindir. Kesin hesap için vergi dairesine veya bir mali müşavire danışın. Girdiğiniz bilgiler
        yalnızca bu sayfada kullanılır, hiçbir yere gönderilmez.
      </div>

      <form className="space-y-6 rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="toplam" className="block font-semibold">
            Mirasın tahmini toplam değeri (TL)
          </label>
          <p id="toplam-aciklama" className="text-base text-metin-ikincil">
            Taşınmaz, araç, banka hesabı gibi tüm varlıkların tahmini toplamı. Örnek: 5.000.000
          </p>
          <input
            id="toplam"
            inputMode="decimal"
            autoComplete="off"
            value={toplamMetin}
            onChange={(e) => setToplamMetin(e.target.value)}
            aria-describedby="toplam-aciklama"
            aria-invalid={toplamMetin !== "" && toplam === null ? true : undefined}
            className={`${kutu} mt-2`}
          />
          {toplamMetin !== "" && toplam === null && (
            <p className="mt-1 text-base text-uyari">Lütfen yalnızca rakam girin (ör. 5.000.000).</p>
          )}
        </div>

        <Secim
          baslik="Vefat eden kişiye yakınlığınız"
          ad="yakinlik"
          deger={yakinlik}
          onChange={(v) => setYakinlik(v as typeof yakinlik)}
          secenekler={[
            ["cocuk", "Çocuğuyum"],
            ["es", "Eşiyim"],
            ["diger", "Diğer (anne-baba, kardeş vb.)"],
          ]}
        />

        {yakinlik === "es" && (
          <Secim
            baslik="Vefat edenin çocuğu veya torunu var mı?"
            ad="cocuk"
            deger={cocukVar ? "evet" : "hayir"}
            onChange={(v) => setCocukVar(v === "evet")}
            secenekler={[
              ["evet", "Evet"],
              ["hayir", "Hayır"],
            ]}
          />
        )}

        <Secim
          baslik="Size düşen pay"
          ad="pay"
          deger={payYontemi}
          onChange={(v) => setPayYontemi(v as typeof payYontemi)}
          secenekler={[
            ["esit", "Bilmiyorum, eşit pay varsay"],
            ["biliyorum", "Payımı biliyorum (mirasçılık belgesinden)"],
          ]}
        />

        {payYontemi === "esit" ? (
          <div>
            <label htmlFor="mirasci" className="block font-semibold">
              Toplam mirasçı sayısı
            </label>
            <input
              id="mirasci"
              inputMode="numeric"
              value={mirasciMetin}
              onChange={(e) => setMirasciMetin(e.target.value)}
              className={`${kutu} mt-2 sm:w-40`}
            />
            <p className="mt-1 text-base text-metin-ikincil">
              Yasal miras payları eşit olmayabilir; bu yalnızca kaba bir varsayımdır.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="payyuzde" className="block font-semibold">
              Payınız (%)
            </label>
            <input
              id="payyuzde"
              inputMode="decimal"
              value={payMetin}
              onChange={(e) => setPayMetin(e.target.value)}
              className={`${kutu} mt-2 sm:w-40`}
            />
          </div>
        )}
      </form>

      <section aria-live="polite" aria-labelledby="sonuc-baslik" className="rounded-2xl border-t-4 border-altin bg-yuzey p-5 shadow-yuksek sm:p-6">
        <h2 id="sonuc-baslik" className="font-serif text-xl font-semibold text-vurgu-koyu">
          Tahmini sonuç
        </h2>
        {!sonuc ? (
          <p className="mt-2 text-metin-ikincil">Sonucu görmek için yukarıdaki alanları doldurun.</p>
        ) : (
          <div className="mt-3 space-y-4">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              <dt>Size düşen tahmini pay</dt>
              <dd className="font-semibold">{tl(sonuc.pay)}</dd>
              <dt>Vergiden istisna tutar</dt>
              <dd className="font-semibold">{tl(sonuc.istisna)}</dd>
              <dt>Vergiye tabi tutar</dt>
              <dd className="font-semibold">{tl(sonuc.matrah)}</dd>
              <dt>Tahmini vergi</dt>
              <dd className="font-serif text-2xl font-semibold text-vurgu-koyu">{tl(sonuc.vergi)}</dd>
            </dl>
            {sonuc.vergi === 0 ? (
              <p>Bu tahmine göre size düşen pay istisna tutarının altında kalıyor ve vergi çıkmıyor.</p>
            ) : (
              <>
                <table className="w-full text-left text-base">
                  <caption className="sr-only">Dilim dökümü</caption>
                  <thead>
                    <tr className="border-b border-cizgi">
                      <th className="py-2 font-semibold">Dilim</th>
                      <th className="py-2 font-semibold">Oran</th>
                      <th className="py-2 text-right font-semibold">Vergi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonuc.dilimler
                      .filter((d) => d.matrah > 0)
                      .map((d) => (
                        <tr key={d.alt} className="border-b border-cizgi">
                          <td className="py-2">{tl(d.matrah)}</td>
                          <td className="py-2">{yuzde(d.oran)}</td>
                          <td className="py-2 text-right">{tl(d.vergi)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <p className="text-base">Ödeme (genel bilgi): {parametreler.veraset_vergisi.odeme}.</p>
              </>
            )}
            <p className="text-base text-metin-ikincil">
              Bu hesaplama borçları ve düşülebilecek giderleri dikkate almaz. Vergi, malların resmi değerleme
              kurallarına göre bulunan değeri üzerinden hesaplanır. Bazı özel durumlarda farklı oranlar
              uygulanabilir; bu hesaplayıcı bunları kapsamaz. {parametreler.yil} tarifesi ve istisna tutarları
              kullanılmıştır.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Secim({
  baslik,
  ad,
  deger,
  onChange,
  secenekler,
}: {
  baslik: string;
  ad: string;
  deger: string;
  onChange: (v: string) => void;
  secenekler: [string, string][];
}) {
  return (
    <fieldset>
      <legend className="font-semibold">{baslik}</legend>
      <div className="mt-2 space-y-2">
        {secenekler.map(([v, etiket]) => (
          <label
            key={v}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2 text-lg ${
              deger === v ? "border-vurgu bg-vurgu-acik font-bold text-vurgu-koyu" : "border-cizgi bg-yuzey hover:border-vurgu"
            }`}
          >
            <input type="radio" name={ad} value={v} checked={deger === v} onChange={() => onChange(v)} className="size-5 accent-vurgu" />
            {etiket}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
