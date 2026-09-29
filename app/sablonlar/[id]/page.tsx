import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sayfa } from "@/components/Sayfa";
import { CihazdaKalir } from "@/components/CihazdaKalir";
import { SablonDoldurucu } from "@/components/SablonDoldurucu";
import { TaslakNotu } from "@/components/TaslakNotu";
import { sablonlariYukle } from "@/lib/icerik/metinler";

export const dynamicParams = false;

export function generateStaticParams() {
  return sablonlariYukle().map((s) => ({ id: s.id }));
}

function bul(id: string) {
  return sablonlariYukle().find((s) => s.id === id);
}

export async function generateMetadata({ params }: PageProps<"/sablonlar/[id]">): Promise<Metadata> {
  const s = bul((await params).id);
  return s ? { title: s.baslik, description: s.aciklama, alternates: { canonical: `/sablonlar/${s.id}` } } : {};
}

export default async function Page({ params }: PageProps<"/sablonlar/[id]">) {
  const s = bul((await params).id);
  if (!s) notFound();
  return (
    <Sayfa baslik={s.baslik}>
      <p className="yazdirma-gizle text-lg text-metin-ikincil">{s.aciklama}</p>
      <CihazdaKalir kutu className="yazdirma-gizle">
        Bu dilekçeye yazdıklarınızı biz görmüyoruz; bilgiler yalnızca bu cihazda kullanılır ve sayfa kapanınca silinir.
      </CihazdaKalir>
      <div className="yazdirma-gizle">
        <TaslakNotu>
          Bu taslak genel bir örnektir.
          Kurumun kendi formu varsa onu kullanın; göndermeden önce içeriği kendi durumunuza göre kontrol edin.
        </TaslakNotu>
      </div>
      {s.notlar.length > 0 && (
        <section aria-labelledby="bilmeniz-gerekenler" className="yazdirma-gizle rounded-2xl bg-yuzey p-5 shadow-kart sm:p-6">
          <h2 id="bilmeniz-gerekenler" className="font-serif text-2xl font-semibold text-vurgu-koyu">
            Vermeden önce bilmeniz gerekenler
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {s.notlar.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          {s.kucuk_not && <p className="mt-3 text-sm text-metin-ikincil">{s.kucuk_not}</p>}
        </section>
      )}
      <SablonDoldurucu id={s.id} govde={s.govde} alanlar={s.alanlar} />
    </Sayfa>
  );
}
