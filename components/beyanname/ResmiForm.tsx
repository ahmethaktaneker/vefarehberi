import { YAKINLIK_ETIKETLERI, tasinmazDegeri, type BeyannameVerisi } from "@/lib/beyanname/hesap";
import type { BeyannameIcerik } from "@/lib/beyanname/sema";
import { tutarOku } from "@/lib/hesaplayici";

/**
 * GİB Veraset ve İntikal Vergisi Beyannamesi (form 1031 A, gib.gov.tr "Beyanname Formları") ile aynı
 * düzende, doldurulmuş iki sayfa: ön yüz (Tablo 1-2) ve arka yüz (Tablo 3-5). Boş kalan alanlar elle
 * doldurulabilsin diye tablolarda boş satırlar bırakılır.
 */

const ONDALIK = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
function tlKr(n: number | null): [string, string] {
  if (n === null) return ["", ""];
  const kurus = Math.round(n * 100);
  return [ONDALIK.format(Math.trunc(kurus / 100)), String(kurus % 100).padStart(2, "0")];
}
const tarih = (t: string) => (t ? t.split("-").reverse().join(".") : "");
const bosSatir = (n: number, dolu: number) => Array.from({ length: Math.max(0, n - dolu) });

const h = "border border-black px-1 py-0.5 align-middle";
const baslikH = `${h} bg-neutral-100 text-center font-semibold text-[8pt] leading-tight`;
const deger = `${h} text-[9pt]`;

export function ResmiForm({ veri: v, icerik }: { veri: BeyannameVerisi; icerik: BeyannameIcerik }) {
  const m = v.muris;
  const turAdi = (id: string) => icerik.tasinmaz.turler.find((t) => t.id === id)?.ad ?? "";
  const digerAdi = (id: string) => icerik.digerleri.find((t) => t.id === id)?.ad ?? "";
  const borcAdi = (id: string) => icerik.borclar.turler.find((t) => t.id === id)?.ad ?? "";

  const tasinmazToplam = v.tasinmazlar.reduce((t, x) => t + (tasinmazDegeri(x) ?? 0), 0);
  const digerToplam = v.digerleri.reduce((t, x) => t + (tutarOku(x.deger) ?? 0), 0);
  const borcToplam = v.borclar.reduce((t, x) => t + (tutarOku(x.tutar) ?? 0), 0);

  return (
    <div className="resmi-form bg-white [font-family:Arial,Helvetica,sans-serif] text-[9pt] leading-snug text-black">
      {/* ÖN YÜZ */}
      <section className="resmi-form-sayfa">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[13pt] font-bold">VERASET VE İNTİKAL VERGİSİ BEYANNAMESİ</p>
          <div className="text-right">
            <p className="font-bold">1031 A</p>
            <p className="mt-2 min-w-24 border-b border-dotted border-black">&nbsp;</p>
            <p className="text-[8pt]">V.D. KODU</p>
          </div>
        </div>

        <table className="mt-3 w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${deger} w-1/2`}>
                <span className="text-[8pt]">1</span> <strong>{v.vergi_dairesi}</strong>
                <br />
                <span className="text-[8pt]">Vergi Dairesi Müdürlüğüne</span>
              </td>
              <td className={deger} colSpan={2}>
                <span className="text-[8pt]">İNTİKALİN ŞEKLİ(*)</span>
                <span className="ml-3">☒ Veraset</span>
                <span className="ml-3">☐ İvazsız İntikaller</span>
              </td>
            </tr>
            <tr>
              <td className={deger}>
                <span className="text-[8pt]">2</span> {v.vd_il_ilce}
                <br />
                <span className="text-[8pt]">İl-İlçe</span>
              </td>
              <td className={deger} colSpan={2}>
                <span className="text-[8pt]">3</span> &nbsp;
                <br />
                <span className="text-[8pt]">Olay Kayıt ve Hs. Def. Sıra No. (Vergi Dairesince Doldurulacaktır.)</span>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-3 w-full border-collapse">
          <caption className="border border-b-0 border-black bg-neutral-100 px-1 py-0.5 text-left font-bold">
            TABLO 1 &nbsp; ÖLENİN VEYA İVAZSIZ İNTİKALDE BULUNANIN
          </caption>
          <tbody>
            <Satir no={1} etiket="Vergi Kimlik Numarası(**)" deger={m.tc} />
            <Satir no={2} etiket="Soyadı / Unvanı" deger={m.soyad} />
            <Satir no={3} etiket="Adı" deger={m.ad} />
            <Satir no={4} etiket="Baba Adı" deger={m.baba_adi} />
            <Satir no={5} etiket="Mesleği / Faaliyeti" deger={m.meslek} />
            <Satir no={6} etiket="Ölüm Yeri ve Tarihi" deger={[m.olum_yeri, tarih(m.vefat_tarihi)].filter(Boolean).join(" / ")} />
            <Satir no={7} etiket="İvazsız İntikalin Meydana Geldiği Yer ve Tarih" deger="" />
            <tr>
              <td className={`${deger} w-6 text-center`} rowSpan={3}>
                8
              </td>
              <td className={`${deger} w-44`} rowSpan={3}>
                İkametgah veya İşyeri Adresi
              </td>
              <td className={deger} colSpan={3}>
                <span className="text-[8pt]">Mahalle:</span> {m.mahalle}
              </td>
            </tr>
            <tr>
              <td className={deger} colSpan={2}>
                <span className="text-[8pt]">Cadde / Sokak:</span> {m.cadde_sokak}
              </td>
              <td className={deger}>
                <span className="text-[8pt]">Posta Kodu:</span> {m.posta_kodu}
              </td>
            </tr>
            <tr>
              <td className={deger}>
                <span className="text-[8pt]">Kapı No.:</span> {m.kapi_no}
              </td>
              <td className={deger}>
                <span className="text-[8pt]">Daire No.:</span> {m.daire_no}
              </td>
              <td className={deger}>
                <span className="text-[8pt]">İl / İlçe:</span> {m.il_ilce}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-3 w-full border-collapse">
          <caption className="border border-b-0 border-black bg-neutral-100 px-1 py-0.5 text-left font-bold">TABLO 2 &nbsp; MÜKELLEFLERİN</caption>
          <thead>
            <tr>
              <th className={baslikH}>Vergi Kimlik No(**)</th>
              <th className={baslikH}>Adı Soyadı / Unvanı</th>
              <th className={baslikH}>Akrabalık Derecesi</th>
              <th className={baslikH}>Doğum Tarihi</th>
              <th className={baslikH}>İkametgah veya İşyeri Adresi / Telefon No.</th>
              <th className={`${baslikH} w-24`}>İMZA</th>
            </tr>
          </thead>
          <tbody>
            {v.mirascilar.map((x) => (
              <tr key={x.id} className="h-10">
                <td className={deger}>{x.tc}</td>
                <td className={deger}>{x.ad}</td>
                <td className={deger}>{YAKINLIK_ETIKETLERI[x.yakinlik]}</td>
                <td className={deger}>{tarih(x.dogum_tarihi)}</td>
                <td className={deger}>{x.adres_tel}</td>
                <td className={deger} />
              </tr>
            ))}
            {bosSatir(6, v.mirascilar.length).map((_, i) => (
              <tr key={`b${i}`} className="h-10">
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className={deger} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 space-y-1 text-[7.5pt]">
          <p>(*) İntikal hangi şekilde meydana gelmiş ise ilgili haneye (x) işareti konulacaktır.</p>
          <p>
            (**) T.C. vatandaşı olan gerçek kişilerde T.C. kimlik numarası, yabancı kimlik numarası bulunan yabancı gerçek kişilerde yabancı
            kimlik numarası yazılacaktır.
          </p>
        </div>
      </section>

      {/* ARKA YÜZ */}
      <section className="resmi-form-sayfa">
        <table className="w-full border-collapse">
          <caption className="border border-b-0 border-black bg-neutral-100 px-1 py-0.5 text-left font-bold">
            TABLO 3 &nbsp; İNTİKAL EDEN GAYRİMENKUL MALLAR
          </caption>
          <thead>
            <tr>
              <th className={baslikH} rowSpan={2}>İli</th>
              <th className={baslikH} rowSpan={2}>İlçesi</th>
              <th className={baslikH} rowSpan={2}>Mahalle veya Köyü</th>
              <th className={baslikH} rowSpan={2}>Sokağı</th>
              <th className={baslikH} rowSpan={2}>Kapı No.</th>
              <th className={baslikH} rowSpan={2}>Cinsi</th>
              <th className={baslikH} rowSpan={2}>Ölenin Hissesi</th>
              <th className={baslikH} colSpan={2}>Bina, Arsa veya Arazinin</th>
              <th className={baslikH} colSpan={2}>Emlak Vergisine Esas Olan Değeri (Hisseye isabet eden tutar)</th>
            </tr>
            <tr>
              <th className={baslikH}>Ada No.</th>
              <th className={baslikH}>Parsel No.</th>
              <th className={baslikH}>(TL)</th>
              <th className={baslikH}>(Kr)</th>
            </tr>
          </thead>
          <tbody>
            {v.tasinmazlar.map((t) => {
              const [tl, kr] = tlKr(tasinmazDegeri(t));
              return (
                <tr key={t.id} className="h-7">
                  <td className={deger}>{t.il}</td>
                  <td className={deger}>{t.ilce}</td>
                  <td className={deger}>{t.mahalle}</td>
                  <td className={deger}>{t.sokak}</td>
                  <td className={deger}>{t.kapi_no}</td>
                  <td className={deger}>{turAdi(t.tur)}</td>
                  <td className={deger}>{t.hisse || "Tam"}</td>
                  <td className={deger}>{t.ada}</td>
                  <td className={deger}>{t.parsel}</td>
                  <td className={`${deger} text-right`}>{tl}</td>
                  <td className={`${deger} text-right`}>{kr}</td>
                </tr>
              );
            })}
            {bosSatir(8, v.tasinmazlar.length).map((_, i) => (
              <BosSatir key={i} sutun={11} />
            ))}
            <ToplamSatiri sutun={9} tutar={tasinmazToplam} />
          </tbody>
        </table>

        <table className="mt-3 w-full border-collapse">
          <caption className="border border-b-0 border-black bg-neutral-100 px-1 py-0.5 text-left font-bold">
            TABLO 4 &nbsp; İNTİKAL EDEN MENKUL MALLAR VE DİĞER SERVET UNSURLARI
          </caption>
          <thead>
            <tr>
              <th className={baslikH} rowSpan={2}>Cinsi</th>
              <th className={baslikH} rowSpan={2}>Nerede Bulunduğu</th>
              <th className={baslikH} rowSpan={2}>Adedi</th>
              <th className={baslikH} rowSpan={2}>Hayat Sigorta Poliçe / Banka Hesap No. / Plaka No. / Telefon No.</th>
              <th className={baslikH} colSpan={2}>İlk Tarhiyat İçin Beyan Edilen Değer</th>
            </tr>
            <tr>
              <th className={baslikH}>(TL)</th>
              <th className={baslikH}>(Kr)</th>
            </tr>
          </thead>
          <tbody>
            {v.digerleri.map((k) => {
              const [tl, kr] = tlKr(tutarOku(k.deger));
              return (
                <tr key={k.id} className="h-7">
                  <td className={deger}>{[digerAdi(k.tur), k.aciklama].filter(Boolean).join(": ")}</td>
                  <td className={deger}>{k.nerede}</td>
                  <td className={deger}>{k.adet}</td>
                  <td className={deger}>{k.numara}</td>
                  <td className={`${deger} text-right`}>{tl}</td>
                  <td className={`${deger} text-right`}>{kr}</td>
                </tr>
              );
            })}
            {bosSatir(6, v.digerleri.length).map((_, i) => (
              <BosSatir key={i} sutun={6} />
            ))}
            <ToplamSatiri sutun={4} tutar={digerToplam} />
          </tbody>
        </table>

        <table className="mt-3 w-full border-collapse">
          <caption className="border border-b-0 border-black bg-neutral-100 px-1 py-0.5 text-left font-bold">
            TABLO 5 &nbsp; İNDİRİLECEK BORÇLAR VE MASRAFLAR
          </caption>
          <thead>
            <tr>
              <th className={baslikH} rowSpan={2}>Cinsi ve Mahiyeti</th>
              <th className={baslikH} colSpan={3}>Ait Olduğu Belgenin</th>
              <th className={baslikH} colSpan={2}>Alacaklıların</th>
              <th className={baslikH} colSpan={2}>Tutar</th>
            </tr>
            <tr>
              <th className={baslikH}>Cinsi</th>
              <th className={baslikH}>Tarihi</th>
              <th className={baslikH}>No. Su</th>
              <th className={baslikH}>Adı, Soyadı / Unvanı</th>
              <th className={baslikH}>İş veya İkametgah Adresi</th>
              <th className={baslikH}>(TL)</th>
              <th className={baslikH}>(Kr)</th>
            </tr>
          </thead>
          <tbody>
            {v.borclar.map((b) => {
              const [tl, kr] = tlKr(tutarOku(b.tutar));
              return (
                <tr key={b.id} className="h-7">
                  <td className={deger}>{[borcAdi(b.tur), b.aciklama].filter(Boolean).join(": ")}</td>
                  <td className={deger}>{b.belge_cinsi}</td>
                  <td className={deger}>{tarih(b.belge_tarihi)}</td>
                  <td className={deger}>{b.belge_no}</td>
                  <td className={deger}>{b.alacakli}</td>
                  <td className={deger}>{b.alacakli_adres}</td>
                  <td className={`${deger} text-right`}>{tl}</td>
                  <td className={`${deger} text-right`}>{kr}</td>
                </tr>
              );
            })}
            {bosSatir(5, v.borclar.length).map((_, i) => (
              <BosSatir key={i} sutun={8} />
            ))}
            <ToplamSatiri sutun={6} tutar={borcToplam} />
          </tbody>
        </table>

        <div className="mt-4 flex items-start justify-between gap-6 text-[8pt]">
          <div className="space-y-0.5">
            <p>Verilecek beyannamelere aşağıdaki belgelerin eklenmesi gerekir.</p>
            <p>a) Veraset ilamı.</p>
            <p>b) Ölüm ve mirasçı bildirimi.</p>
            <p>c) Gayrimenkul mallar için ilgili belediyelerden alınacak emlak vergisine esas olan değeri gösterir belge.</p>
            <p>d) İndirilmesi talep edilen borç ve masraflara ait belgeler.</p>
            <p>e) Ticari bilanço ve gelir tablosu.</p>
            <p className="pt-1">(*) 01.01.1983 tarihinden önce meydana gelen intikallerde gayrimenkulleri intikal tarihindeki rayiç bedeli yazılır.</p>
          </div>
          <p className="shrink-0 whitespace-nowrap pt-6">…../…../20…..</p>
        </div>
      </section>
    </div>
  );
}

function Satir({ no, etiket, deger: d }: { no: number; etiket: string; deger: string }) {
  return (
    <tr className="h-7">
      <td className={`${deger} w-6 text-center`}>{no}</td>
      <td className={`${deger} w-44`}>{etiket}</td>
      <td className={`${deger} font-semibold`} colSpan={3}>
        {d}
      </td>
    </tr>
  );
}

function BosSatir({ sutun }: { sutun: number }) {
  return (
    <tr className="h-7">
      {Array.from({ length: sutun }).map((_, i) => (
        <td key={i} className={deger} />
      ))}
    </tr>
  );
}

function ToplamSatiri({ sutun, tutar }: { sutun: number; tutar: number }) {
  const [tl, kr] = tlKr(tutar);
  return (
    <tr>
      <td className={`${deger} text-right font-bold`} colSpan={sutun}>
        TOPLAM
      </td>
      <td className={`${deger} text-right font-bold`}>{tutar ? tl : ""}</td>
      <td className={`${deger} text-right font-bold`}>{tutar ? kr : ""}</td>
    </tr>
  );
}
