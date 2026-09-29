/**
 * JSON-LD'yi <script> içine güvenle gömmek için metne çevirir. "<" karakteri < kaçış dizisine
 * dönüştürülür; böylece içerikteki "</script>" betik etiketini kapatamaz. JSON olarak anlamı değişmez.
 */
export function jsonLdMetni(veri: unknown): string {
  return JSON.stringify(veri).replace(/</g, "\\u003c");
}
