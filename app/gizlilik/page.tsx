import type { Metadata } from "next";
import { Sayfa } from "@/components/Sayfa";
import { URUN_ADI } from "@/lib/marka";

export const metadata: Metadata = {
  title: "Gizlilik",
  alternates: { canonical: "/gizlilik" },
};

/*
 * TASLAK. Bu sayfadaki maddeler PROJE_BRIEF.md Bölüm 4.4'teki ürün ilkelerinden alınmıştır.
 * Hukuki metin değildir; avukat kontrolünden sonra kesinleşecektir.
 */
export default function Gizlilik() {
  return (
    <Sayfa baslik="Gizlilik">
      <Bolum baslik="Kısaca">
        <p>
          {URUN_ADI}, kişisel bilgilerinizi istemeden çalışacak şekilde tasarlanmıştır. Sorulara
          verdiğiniz cevaplar sunucularımıza gönderilmez, yalnızca kendi cihazınızın tarayıcısında
          tutulur.
        </p>
      </Bolum>

      <Bolum baslik="Sizden istemediğimiz bilgiler">
        <ul className="list-disc space-y-1 pl-6">
          <li>T.C. kimlik numarası</li>
          <li>Ölüm nedeni veya herhangi bir sağlık bilgisi</li>
          <li>Tam adres</li>
          <li>Banka hesap numarası</li>
          <li>Vefat eden kişinin ve mirasçıların isimleri</li>
        </ul>
      </Bolum>

      <Bolum baslik="Cevaplarınız nerede tutulur">
        <p>
          Cevaplarınız ve işaretlediğiniz adımlar tarayıcınızda saklanır. Aile üyelerinizle
          paylaştığınız bağlantı, cevapları adresin <code>#</code> işaretinden sonraki kısmında
          taşır; bu kısım sunucuya iletilmez.
        </p>
      </Bolum>

      <Bolum baslik="Ziyaret istatistikleri">
        <p>
          Siteyi geliştirmek için çerez kullanmayan, kişisel veri içermeyen sayımlar yapılır (ör.
          &ldquo;bir bölüm görüntülendi&rdquo;). Cevaplarınızın içeriği bu sayımlara eklenmez.
        </p>
        <p>
          Bu sayımlar için çerez kullanmayan Umami aracını kullanıyoruz. Tarayıcınızda &ldquo;izlenmek
          istemiyorum&rdquo; (Do Not Track) ayarı açıksa hiçbir sayım yapılmaz.
        </p>
      </Bolum>

      <Bolum baslik="E-posta adresi">
        <p>
          Yeni özelliklerden haber almak için e-posta bırakırsanız, yalnızca e-posta adresiniz ve kayıt
          tarihi, e-posta hizmeti sağlayıcımız INBOX&apos;ta saklanır. Kayıt en geç 12 ay sonra silinir. Ayrıntılar
          aydınlatma metnindedir.
        </p>
      </Bolum>

      <Bolum baslik="İletişim">
        <p className="text-metin-ikincil">[Veri sorumlusu ve iletişim adresi: doldurulacak]</p>
      </Bolum>
    </Sayfa>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-semibold">{baslik}</h2>
      {children}
    </section>
  );
}
