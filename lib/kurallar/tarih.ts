import { addMonths, differenceInCalendarDays, format } from "date-fns";
import { tr } from "date-fns/locale";

/**
 * Tarihler "YYYY-MM-DD" metni olarak taşınır; saat bilgisi yoktur.
 * "Bugün" her zaman Europe/Istanbul saat dilimine göre belirlenir.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function tarihGecerli(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const m = ISO.exec(s);
  if (!m) return false;
  const d = tarihOku(s);
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}

function tarihOku(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function tarihYaz(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Ay ekler. Ayın son günü taşarsa hedef ayın son gününe düşer (31 Ocak + 1 ay = 28/29 Şubat). */
export function ayEkle(s: string, ay: number): string {
  return tarihYaz(addMonths(tarihOku(s), ay));
}

/** İstanbul saatine göre bugünün tarihi. */
export function istanbulBugun(simdi: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(simdi);
}

/** Son tarihe kalan gün. 0 = bugün son gün, negatif = süre geçmiş. */
export function kalanGun(sonTarih: string, bugun: string): number {
  return differenceInCalendarDays(tarihOku(sonTarih), tarihOku(bugun));
}

/** "28 Aralık 2026" */
export function tarihMetni(s: string): string {
  return format(tarihOku(s), "d MMMM yyyy", { locale: tr });
}
