"use client";

import { useEffect, useRef } from "react";
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

const ISLEM_ETIKETLERI = { devir: "Devir", iptal: "İptal", genel: "Genel bilgi" } as const;

export function KurumRehberi({ kurumlar, belgeler, acikId }: { kurumlar: Kurum[]; belgeler: Record<string, Belge>; acikId?: string }) {
  const turler = (Object.keys(TUR_ETIKETLERI) as KurumTuru[]).filter((t) => kurumlar.some((k) => k.tur === t));
  return (
    <div className="space-y-8">
      <p className="text-base text-metin-ikincil">
        Elektrik, doğalgaz ve su şirketinizin adı faturanızda yazar. İstanbul, Ankara ve İzmir’deki şirketler ayrı ayrı; diğer iller için genel bilgi verilir. Kurumların kendi sitelerinde yazanlar ile
        kullanıcı deneyimleri ayrı gösterilir. İşleme gitmeden önce kurumdan teyit edin.
      </p>
      {turler.map((tur) => (
        <section key={tur} aria-labelledby={`kurum-${tur}`}>
          <h3 id={`kurum-${tur}`} className="mb-3 font-serif text-lg font-semibold text-vurgu-koyu">
            {TUR_ETIKETLERI[tur]}
          </h3>
          <ul className="space-y-3">
            {kurumlar
              .filter((k) => k.tur === tur)
              .map((k) => (
                <KurumKarti key={k.id} kurum={k} belgeler={belgeler} acik={k.id === acikId} />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function KurumKarti({ kurum: k, belgeler, acik }: { kurum: Kurum; belgeler: Record<string, Belge>; acik: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (acik) ref.current?.scrollIntoView({ block: "start" });
  }, [acik]);
  const resmiBilgiVar = k.islemler.some((i) => i.notlar_resmi.length || i.kanal.length) || k.guvence_bedeli_iadesi.length > 0;
  return (
    <li ref={ref} id={`kurum-${k.id}`} className="scroll-mt-4 rounded-2xl border border-cizgi bg-yuzey">
      <details className="group p-4" open={acik}>
        <summary className="min-h-12 cursor-pointer list-none">
          <span className="text-lg font-semibold">{k.ad}</span>
          {k.bolge && <span className="block text-base text-metin-ikincil">{k.bolge}</span>}
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-base text-vurgu-koyu underline underline-offset-4 group-open:hidden">Ayrıntılar</span>
            <span className="hidden text-base text-vurgu-koyu underline underline-offset-4 group-open:inline">Kapat</span>
          </span>
        </summary>

        <div className="mt-4 space-y-4">
          {!resmiBilgiVar && !k.genel && (
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
              {i.notlar_deneyim.length > 0 && <Deneyimler notlar={i.notlar_deneyim} kaynaklar={k.kaynak} />}
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

          {k.edevlet.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">e-Devlet</h4>
              <div className="flex flex-col gap-2">
                {k.edevlet.map((e) => (
                  <a
                    key={e.url}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center self-start rounded-xl border-2 border-vurgu-koyu px-4 py-2 text-base font-semibold text-vurgu-koyu no-underline hover:bg-vurgu-acik"
                  >
                    e-Devlet&apos;te aç: {e.ad}
                    <span className="sr-only"> (yeni sekmede açılır)</span>
                  </a>
                ))}
              </div>
              {k.tur !== "banka" && (
                <p className="text-sm text-metin-ikincil">
                  Abonelik vefat edenin adına kayıtlıysa e-Devlet&apos;te sizin hesabınızda görünmeyebilir; o durumda kurumun şubesine başvurun.
                </p>
              )}
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

/** Kullanıcı deneyimlerinin alındığı şikâyet siteleri ve forumlar (kaynak adresinden). */
const DENEYIM_SITELERI: [RegExp, string][] = [
  [/sikayetvar.com/, "Şikayetvar"],
  [/eksisozluk.com/, "Ekşi Sözlük"],
  [/donanimhaber.com/, "DonanımHaber"],
];

function Deneyimler({ notlar, kaynaklar }: { notlar: string[]; kaynaklar: string[] }) {
  const siteler = DENEYIM_SITELERI.filter(([d]) => kaynaklar.some((u) => d.test(u))).map(([, ad]) => ad);
  return (
    <div>
      <p className="text-base font-semibold text-metin-ikincil">Kullanıcıların anlattıkları</p>
      <p className="text-sm text-metin-ikincil">
        {siteler.length > 0 ? `Kaynak: ${siteler.join(", ")}.` : "Kaynak: şikâyet siteleri ve forumlar."} Doğrulanmamıştır, resmi bilgi
        değildir. Kurumu değerlendirmek için değil, hazırlıklı olmanız için paylaşıyoruz.
      </p>
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

