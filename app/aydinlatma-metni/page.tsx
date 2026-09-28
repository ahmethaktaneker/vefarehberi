import type { Metadata } from "next";
import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";
import { TaslakNotu } from "@/components/TaslakNotu";

export const metadata: Metadata = {
  title: "Aydınlatma metni",
  alternates: { canonical: "/aydinlatma-metni" },
};

/*
 * TASLAK İSKELET. KVKK aydınlatma metninin içeriği hukuki metindir ve burada yazılmamıştır.
 * Başlıklar yalnızca avukattan gelecek metnin yerleşeceği bölümleri gösterir.
 */
const BOLUMLER = [
  "Veri sorumlusu",
  "İşlenen kişisel veriler",
  "İşleme amaçları",
  "Hukuki sebepler",
  "Aktarım",
  "Saklama süresi",
  "Haklarınız",
  "Başvuru yolu",
];

export default function AydinlatmaMetni() {
  return (
    <Sayfa baslik="Aydınlatma metni">
      <TaslakNotu>
        Bu metin hazırlanmaktadır ve avukat kontrolünden sonra yayınlanacaktır. Kişisel bilgilerin
        nasıl ele alındığına dair özet için{" "}
        <Link href="/gizlilik" className="text-vurgu-koyu underline underline-offset-4">
          Gizlilik
        </Link>{" "}
        sayfasına bakabilirsiniz.
      </TaslakNotu>

      {BOLUMLER.map((b) => (
        <section key={b} className="space-y-2">
          <h2 className="font-serif text-xl font-semibold">{b}</h2>
          <p className="text-metin-ikincil">[Avukat metni eklenecek]</p>
        </section>
      ))}
    </Sayfa>
  );
}
