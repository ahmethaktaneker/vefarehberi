/**
 * Son tarihler için .ics (iCalendar, RFC 5545) dosyası. Tarayıcıda üretilir, sunucuya gönderilmez.
 * Her son tarih tüm gün süren bir etkinliktir; 7 gün ve 1 gün önce hatırlatma içerir.
 */

export type TakvimOlayi = { id: string; baslik: string; tarih: string; aciklama: string };

function metinKacir(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** 75 bayttan uzun satırları katlar (UTF-8 karakterlerini bölmeden). */
function katla(satir: string): string {
  const kodlayici = new TextEncoder();
  const parcalar: string[] = [];
  let parca = "";
  let bayt = 0;
  for (const karakter of satir) {
    const b = kodlayici.encode(karakter).length;
    const sinir = parcalar.length === 0 ? 75 : 74; // devam satırları bir boşlukla başlar
    if (bayt + b > sinir) {
      parcalar.push(parca);
      parca = "";
      bayt = 0;
    }
    parca += karakter;
    bayt += b;
  }
  parcalar.push(parca);
  return parcalar.join("\r\n ");
}

const gun = (tarih: string) => tarih.replaceAll("-", "");

function sonrakiGun(tarih: string): string {
  const [y, m, d] = tarih.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return t.toISOString().slice(0, 10);
}

export function icsOlustur(olaylar: TakvimOlayi[], simdi: Date = new Date()): string {
  const damga = simdi.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const satirlar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vefa Rehberi//Son tarihler//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const o of olaylar) {
    satirlar.push(
      "BEGIN:VEVENT",
      `UID:${o.id}-${gun(o.tarih)}@vefarehberi.com`,
      `DTSTAMP:${damga}`,
      `DTSTART;VALUE=DATE:${gun(o.tarih)}`,
      `DTEND;VALUE=DATE:${gun(sonrakiGun(o.tarih))}`,
      `SUMMARY:${metinKacir(`Son tarih: ${o.baslik}`)}`,
      `DESCRIPTION:${metinKacir(o.aciklama)}`,
      "TRANSP:TRANSPARENT",
    );
    for (const once of ["P7D", "P1D"]) {
      satirlar.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${metinKacir(o.baslik)}`,
        `TRIGGER:-${once}`,
        "END:VALARM",
      );
    }
    satirlar.push("END:VEVENT");
  }
  satirlar.push("END:VCALENDAR");
  return satirlar.map(katla).join("\r\n") + "\r\n";
}
