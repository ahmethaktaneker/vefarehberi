import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sayfaGizli } from "@/lib/marka";
import { Sayfa } from "@/components/Sayfa";
import { icerikYukle } from "@/lib/icerik/yukle";

export const metadata: Metadata = {
  title: "Sözlük: Vefat Sonrası İşlemlerde Geçen Terimler",
  description: "Mirasçılık belgesi, muvafakatname, ilişik kesme belgesi, rayiç bedel gibi vefat sonrası işlemlerde geçen terimlerin kısa açıklamaları.",
  alternates: { canonical: "/sozluk" },
};

export default function Page() {
  if (sayfaGizli("/sozluk")) notFound();
  const terimler = [...icerikYukle().sozluk].sort((a, b) => a.terim.localeCompare(b.terim, "tr"));
  return (
    <Sayfa baslik="Sözlük">
      <p className="text-lg text-metin-ikincil">Vefat sonrası işlemlerde sık geçen terimlerin kısa ve genel açıklamaları.</p>
      <dl className="space-y-4">
        {terimler.map((t) => (
          <div key={t.terim} className="rounded-2xl bg-yuzey p-5 shadow-kart">
            <dt className="font-serif text-lg font-semibold text-vurgu-koyu">
              {t.terim}
              {t.esanlamlilar.length > 0 && <span className="font-normal text-metin-ikincil"> ({t.esanlamlilar.join(", ")})</span>}
            </dt>
            <dd className="mt-1">{t.aciklama}</dd>
          </div>
        ))}
      </dl>
    </Sayfa>
  );
}
