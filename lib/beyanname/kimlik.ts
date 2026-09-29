import type { BeyannameVerisi } from "@/lib/beyanname/hesap";

/**
 * T.C. kimlik numaraları beyanname verisinden ayrı tutulur: kalıcı depoya (localStorage) yazılmaz,
 * yalnızca sekme açıkken oturum deposunda (sessionStorage) durur. Paylaşılan bir bilgisayarda sonraki
 * kişinin bu numaraları görmesini önler. Şifreleme değildir: aynı sayfadaki betikler yine okuyabilir.
 */
export type KimlikNumaralari = { muris: string; mirascilar: Record<string, string> };

export const bosKimlik = (): KimlikNumaralari => ({ muris: "", mirascilar: {} });

/** Veriyi, kalıcı depoya yazılacak (numarasız) kısım ve numaralar olarak ikiye ayırır. */
export function kimlikAyir(v: BeyannameVerisi): { saklanacak: BeyannameVerisi; kimlik: KimlikNumaralari } {
  const kimlik: KimlikNumaralari = { muris: v.muris.tc, mirascilar: {} };
  for (const m of v.mirascilar) if (m.tc) kimlik.mirascilar[m.id] = m.tc;
  const saklanacak: BeyannameVerisi = {
    ...v,
    muris: { ...v.muris, tc: "" },
    mirascilar: v.mirascilar.map((m) => ({ ...m, tc: "" })),
  };
  return { saklanacak, kimlik };
}

/** Numaraları ekranda ve çıktıda kullanmak için veriye geri ekler. Eski kayıtta numara varsa korunur. */
export function kimlikBirlestir(v: BeyannameVerisi, k: KimlikNumaralari): BeyannameVerisi {
  return {
    ...v,
    muris: { ...v.muris, tc: k.muris || v.muris.tc },
    mirascilar: v.mirascilar.map((m) => ({ ...m, tc: k.mirascilar[m.id] || m.tc })),
  };
}

/** Kalıcı depodaki veride (eski sürümden kalma) numara var mı? Varsa oturum deposuna taşınmalı. */
export const kaliciNumaraVar = (v: BeyannameVerisi) => !!v.muris.tc || v.mirascilar.some((m) => !!m.tc);
