import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sayfa } from "@/components/Sayfa";
import { SablonDoldurucu } from "@/components/SablonDoldurucu";
import { TaslakNotu } from "@/components/TaslakNotu";
import { sablonlariYukle } from "@/lib/icerik/metinler";
import { KONTROL_ROZETLERI } from "@/lib/marka";

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
      <div className="yazdirma-gizle">
        <TaslakNotu>
          Bu taslak genel bir örnektir{KONTROL_ROZETLERI && !s.dogrulandi && " ve hukuk uzmanı kontrolünden geçmemiştir"}.
          Kurumun kendi formu varsa onu kullanın; göndermeden önce içeriği kendi durumunuza göre kontrol edin.
        </TaslakNotu>
      </div>
      <SablonDoldurucu id={s.id} govde={s.govde} alanlar={s.alanlar} />
    </Sayfa>
  );
}
