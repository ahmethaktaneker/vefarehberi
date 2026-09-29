"use client";

/**
 * Ekrandaki bir formu A4 PDF'e çevirir. Telefonda tarayıcının yazdırma penceresi sayfayı dar
 * ekran genişliğinde dizip formun sağını kesebildiği için, form her cihazda aynı genişlikte (A4 içi
 * 190 mm) resme çevrilir ve her ".resmi-form-sayfa" bölümü ayrı bir A4 sayfasına yerleştirilir.
 * Hiçbir bilgi sunucuya gönderilmez; PDF tarayıcıda üretilir. İndirme burada başlatılmaz: PDF birkaç saniyede
 * hazırlandığı için telefon tarayıcıları kendiliğinden başlayan indirmeyi engelleyebilir. Çağıran taraf,
 * kullanıcının dokunacağı indirme / paylaşma düğmeleri gösterir.
 */
export const PDF_GENISLIK_PX = 718; // 190 mm, 96 dpi

export async function formuPdfYap(kap: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const sayfalar = Array.from(kap.querySelectorAll<HTMLElement>(".resmi-form-sayfa"));
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const kenar = 10;
  const enFazlaGen = 210 - kenar * 2;
  const enFazlaYuk = 297 - kenar * 2;
  for (const [i, s] of (sayfalar.length ? sayfalar : [kap]).entries()) {
    const tuval = await html2canvas(s, { scale: 2, backgroundColor: "#ffffff", windowWidth: 1024 });
    const oran = Math.min(enFazlaGen / tuval.width, enFazlaYuk / tuval.height);
    if (i > 0) pdf.addPage();
    pdf.addImage(tuval.toDataURL("image/jpeg", 0.92), "JPEG", kenar, kenar, tuval.width * oran, tuval.height * oran);
  }
  return pdf.output("blob");
}
