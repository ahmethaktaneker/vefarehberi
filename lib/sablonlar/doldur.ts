/** Şablonu kullanıcının girdiği değerlerle doldurur; boş alanlar noktalı çizgi olarak kalır. Tarayıcıda çalışır. */
export function sablonDoldur(govde: string, degerler: Record<string, string>): string {
  return govde.replace(/{{([a-z0-9_]+)}}/g, (_, id: string) => degerler[id]?.trim() || "........................");
}
