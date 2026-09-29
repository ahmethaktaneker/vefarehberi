/** E-posta toplama: tarayıcı ve sunucu ortak kuralları. */

const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function epostaTemizle(e: string): string | null {
  const t = e.trim().toLowerCase();
  return t.length <= 254 && EPOSTA.test(t) ? t : null;
}


/** INBOX web formuna gönderilecek gövde: yalnızca e-posta adresi, formun kendi alan adıyla. */
export function inboxGovdesi(eposta: string, alan: string): URLSearchParams {
  return new URLSearchParams({ [alan]: eposta });
}
