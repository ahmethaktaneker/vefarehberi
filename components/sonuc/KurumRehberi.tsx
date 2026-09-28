import type { Belge, Kurum, KurumTuru } from "@/lib/icerik/sema";

const TUR_ETIKETLERI: Record<KurumTuru, string> = {
  operator: "Telefon ve internet",
  banka: "Bankalar",
  enerji: "Elektrik",
  dogalgaz: "Doğalgaz",
  su: "Su",
  dijital: "Dijital hizmetler",
  diger: "Diğer",
};

/** Adım kartlarından bir kuruma gidilirken kartı açar. */
export function kurumaGit(id: string) {
  const detay = document.getElementById(`kurum-${id}`)?.querySelector("details");
  if (detay) detay.open = true;
}

const ISLEM_ETIKETLERI = { devir: "Devir", iptal: "İptal", genel: "Genel bilgi" } as const;

export function KurumRehberi({ kurumlar, belgeler }: { kurumlar: Kurum[]; belgeler: Record<string, Belge> }) {
  const turler = (Object.keys(TUR_ETIKETLERI) as KurumTuru[]).filter((t) => kurumlar.some((k) => k.tur === t));
  return (
    <div className="space-y-8">
      <p className="-mt-2 text-base text-metin-ikincil">
        Elektrik ve doğalgaz şirketinizin adı faturanızda yazar. Kurumların kendi sitelerinde yazanlar ile
        kullanıcı deneyimleri ayrı gösterilir. İşleme gitmeden önce kurumdan teyit edin.
      </p>
      {turler.map((tur) => (
        <section key={tur} aria-labelledby={`kurum-${tur}`}>
          <h3 id={`kurum-${tur}`} className="mb-3 text-lg font-semibold text-metin-ikincil">
            {TUR_ETIKETLERI[tur]}
          </h3>
          <ul className="space-y-3">
            {kurumlar
              .filter((k) => k.tur === tur)
              .map((k) => (
                <KurumKarti key={k.id} kurum={k} belgeler={belgeler} />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function KurumKarti({ kurum: k, belgeler }: { kurum: Kurum; belgeler: Record<string, Belge> }) {
  const resmiBilgiVar = k.islemler.some((i) => i.notlar_resmi.length || i.kanal.length) || k.guvence_bedeli_iadesi.length > 0;
  return (
    <li id={`kurum-${k.id}`} className="scroll-mt-24 rounded-lg border border-cizgi bg-yuzey">
      <details className="group p-4">
        <summary className="min-h-12 cursor-pointer list-none">
          <span className="text-lg font-semibold">{k.ad}</span>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            {!k.dogrulandi && (
              <span className="rounded-full border border-cizgi bg-bilgi-acik px-2.5 py-0.5 text-base text-metin-ikincil">
                Kontrol ediliyor
              </span>
            )}
            {k.usulsuz_kullanim_uyarisi && (
              <span className="rounded-full bg-uyari-acik px-2.5 py-0.5 text-base text-uyari">Usulsüz kullanım riski</span>
            )}
            <span className="text-base text-vurgu-koyu underline underline-offset-4 group-open:hidden">Ayrıntılar</span>
            <span className="hidden text-base text-vurgu-koyu underline underline-offset-4 group-open:inline">Kapat</span>
          </span>
        </summary>

        <div className="mt-4 space-y-4">
          {!resmiBilgiVar && (
            <p className="text-base text-metin-ikincil">
              Kurumun kendi sitesinde vefat işlemlerine dair ayrıntılı bilgi bulamadık. İşlem öncesinde kurumdan teyit edin.
            </p>
          )}
          {k.iletisim && <p className="text-base">{k.iletisim}</p>}

          {k.islemler.map((i, n) => (
            <div key={n} className="space-y-2">
              {k.islemler.length > 1 || i.tip !== "genel" ? <h4 className="font-semibold">{ISLEM_ETIKETLERI[i.tip]}</h4> : null}
              {i.kanal.length > 0 && <p className="text-base">Nereden: {i.kanal.join(", ")}</p>}
              {i.belgeler.length > 0 && (
                <p className="text-base">İstenebilecek belgeler: {i.belgeler.map((b) => belgeler[b]?.ad ?? b).join(", ")}</p>
              )}
              {i.notlar_resmi.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-base">
                  {i.notlar_resmi.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
              {i.notlar_deneyim.length > 0 && <Deneyimler notlar={i.notlar_deneyim} />}
            </div>
          ))}

          {k.guvence_bedeli_iadesi.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Güvence bedeli iadesi</h4>
              <ul className="list-disc space-y-1 pl-5 text-base">
                {k.guvence_bedeli_iadesi.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {k.web && (
            <a href={k.web} target="_blank" rel="noopener noreferrer" className="inline-block text-base text-vurgu-koyu underline underline-offset-4">
              Kurumun sayfası<span className="sr-only"> (yeni sekmede açılır)</span>
            </a>
          )}
          <p className="text-base text-metin-ikincil">Son kontrol: {k.son_kontrol.split("-").reverse().join(".")}</p>
        </div>
      </details>
    </li>
  );
}

function Deneyimler({ notlar }: { notlar: string[] }) {
  return (
    <div>
      <p className="text-base font-semibold text-metin-ikincil">Kullanıcı deneyimi (resmi bilgi değildir)</p>
      <ul className="mt-1 space-y-2">
        {notlar.map((n) => (
          <li key={n} className="border-l-4 border-cizgi pl-3 text-base">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

