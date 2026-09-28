import Link from "next/link";
import { Sayfa } from "@/components/Sayfa";

export default function BulunamadiSayfasi() {
  return (
    <Sayfa baslik="Aradığınız sayfa bulunamadı">
      <p className="text-lg">Bağlantı eski veya hatalı olabilir. Aşağıdan devam edebilirsiniz.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="dugme dugme-birincil">
          Ana sayfa
        </Link>
        <Link href="/rehber" className="dugme dugme-ikincil">
          Rehberler
        </Link>
      </div>
    </Sayfa>
  );
}
