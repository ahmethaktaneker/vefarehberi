import { YAKINLIK_ETIKETLERI, hisseOku, type BeyannameVerisi, type Ek, type Ozet } from "@/lib/beyanname/hesap";
import type { BeyannameIcerik } from "@/lib/beyanname/sema";
import { tutarOku } from "@/lib/hesaplayici";

const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const tl = (n: number) => `${para.format(n)} TL`;
const tutar = (m: string) => {
  const n = tutarOku(m);
  return n === null ? "—" : tl(n);
};
const tarih = (t: string) => (t ? t.split("-").reverse().join(".") : "—");

/**
 * Hazırlık dosyası: bölümler GİB İnteraktif Vergi Dairesi "Veraset İşlemleri" ekranlarıyla aynı sırada.
 * Hem ekranda (özet adımı) hem yazdırmada kullanılır.
 */
export function BeyannameDosyasi({ veri: v, ozet, ekler, icerik }: { veri: BeyannameVerisi; ozet: Ozet; ekler: Ek[]; icerik: BeyannameIcerik }) {
  const turAdi = (id: string) => icerik.tasinmaz.turler.find((t) => t.id === id)?.ad ?? id;
  const digerAdi = (id: string) => icerik.digerleri.find((t) => t.id === id)?.ad ?? id;
  const borcAdi = (id: string) => icerik.borclar.turler.find((t) => t.id === id)?.ad ?? id;

  return (
    <div className="space-y-6 text-base">
      <div className="hidden print:block">
        <p className="font-serif text-2xl font-semibold">Veraset ve intikal vergisi beyannamesi: hazırlık dosyası</p>
        <p>Vefat Rehberi ile hazırlandı. Tutarlar tahminidir; vergi dairesi kendi hesabını yapar.</p>
      </div>

      <Bolum no={1} baslik="Vefat eden ve miras paydası">
        <Tablo
          satirlar={[
            ["Adı soyadı", v.muris.ad || "—"],
            ["Vefat tarihi", tarih(v.muris.vefat_tarihi)],
            ["Son ikamet", v.muris.ikamet || "—"],
            ["Toplam miras paydası", v.payda || "—"],
          ]}
        />
      </Bolum>

      <Bolum no={2} baslik="Mirasçılar">
        {v.mirascilar.length === 0 ? (
          <p>Mirasçı eklenmedi.</p>
        ) : (
          <Tablo
            baslik={["Adı soyadı", "Yakınlık", "Pay"]}
            satirlar={v.mirascilar.map((m) => [m.ad || "—", YAKINLIK_ETIKETLERI[m.yakinlik], m.pay && v.payda ? `${m.pay}/${v.payda}` : "—"])}
          />
        )}
      </Bolum>

      <Bolum no={3} baslik="Taşınmazlar">
        {v.tasinmazlar.length === 0 ? (
          <p>Yok.</p>
        ) : (
          <Tablo
            baslik={["Türü ve yeri", "Hisse", "Emlak vergisi değeri", "Beyan edilecek"]}
            satirlar={v.tasinmazlar.map((t) => {
              const n = tutarOku(t.deger);
              const h = hisseOku(t.hisse) ?? 1;
              return [[turAdi(t.tur), t.konum].filter(Boolean).join(", "), t.hisse || "Tamamı", tutar(t.deger), n === null ? "—" : tl(n * h)];
            })}
          />
        )}
      </Bolum>

      <Bolum no={4} baslik="Haklar">
        {v.haklar.length === 0 ? <p>Yok.</p> : <ul className="list-disc pl-5">{v.haklar.map((h) => <li key={h.id}>{h.aciklama || "—"}</li>)}</ul>}
      </Bolum>

      <Bolum no={5} baslik="Diğer varlıklar">
        {v.digerleri.length === 0 ? (
          <p>Yok.</p>
        ) : (
          <Tablo baslik={["Türü", "Açıklama", "Değeri"]} satirlar={v.digerleri.map((k) => [digerAdi(k.tur), k.aciklama || "—", tutar(k.deger)])} />
        )}
      </Bolum>

      <Bolum no={6} baslik="Borçlar ve masraflar">
        {v.borclar.length === 0 ? (
          <p>Yok.</p>
        ) : (
          <Tablo baslik={["Türü", "Açıklama", "Tutar"]} satirlar={v.borclar.map((b) => [borcAdi(b.tur), b.aciklama || "—", tutar(b.tutar)])} />
        )}
      </Bolum>

      <Bolum no={7} baslik="Eklenecek belgeler">
        <ul className="space-y-1">
          {ekler.map((e) => (
            <li key={e.id} className="flex gap-2">
              <span aria-hidden="true">{v.hazirEkler.includes(e.id) ? "☑" : "☐"}</span>
              <span>
                {e.ad}
                {e.neden && <span className="text-metin-ikincil"> ({e.neden})</span>}
                <span className="sr-only">{v.hazirEkler.includes(e.id) ? ": hazır" : ": eksik"}</span>
              </span>
            </li>
          ))}
        </ul>
      </Bolum>

      <section className="break-inside-avoid rounded-xl border-2 border-vurgu-koyu p-4">
        <h3 className="font-serif text-xl font-semibold text-vurgu-koyu">Hesap özeti (tahmini)</h3>
        <Tablo
          satirlar={[
            ["Taşınmazlar", tl(ozet.tasinmazToplami)],
            ["Diğer varlıklar", tl(ozet.digerToplami)],
            ["Borç ve masraflar", `− ${tl(ozet.indirim)}`],
            ["Net miras", tl(ozet.net)],
          ]}
        />
        {ozet.mirascilar.length > 0 && (
          <Tablo
            baslik={["Mirasçı", "Payına düşen", "İstisna", "Tahmini vergi"]}
            satirlar={ozet.mirascilar.map((m) => [
              m.mirasci.ad || YAKINLIK_ETIKETLERI[m.mirasci.yakinlik],
              m.tutar === null ? "Pay eksik" : tl(m.tutar),
              m.vergi ? tl(m.vergi.istisna) : "—",
              m.vergi ? tl(m.vergi.vergi) : "—",
            ])}
          />
        )}
        <p className="mt-2">
          Toplam tahmini vergi: <strong>{tl(ozet.toplamVergi)}</strong>. Vergi çıkarsa 3 yılda, mayıs ve kasım aylarında 6 eşit taksitte ödenir.
        </p>
      </section>

      <section className="break-inside-avoid space-y-2">
        <h3 className="font-serif text-xl font-semibold text-vurgu-koyu">Nereye, nasıl?</h3>
        <p>{icerik.vergi_dairesi}</p>
        <p>{icerik.cevrimici}</p>
        <p className="text-metin-ikincil">
          Bu dosya bir hazırlık aracıdır; resmi beyanname yerine geçmez. Tutarları ve kuralları vergi dairesinden teyit edin.
        </p>
      </section>
    </div>
  );
}

function Bolum({ no, baslik, children }: { no: number; baslik: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid space-y-2">
      <h3 className="font-serif text-xl font-semibold text-vurgu-koyu">
        {no}. {baslik}
      </h3>
      {children}
    </section>
  );
}

function Tablo({ baslik, satirlar }: { baslik?: string[]; satirlar: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-2 w-full border-collapse text-left">
        {baslik && (
          <thead>
            <tr>
              {baslik.map((b) => (
                <th key={b} scope="col" className="border-b-2 border-cizgi py-2 pr-3 font-semibold">
                  {b}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {satirlar.map((s, i) => (
            <tr key={i}>
              {s.map((h, j) =>
                j === 0 && !baslik ? (
                  <th key={j} scope="row" className="border-b border-cizgi py-2 pr-3 font-normal text-metin-ikincil">
                    {h}
                  </th>
                ) : (
                  <td key={j} className="border-b border-cizgi py-2 pr-3">
                    {h}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
