import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { parse } from "yaml";
import { z } from "zod";

/**
 * Ücretli araçlara erişim kodu. Kodun kendisi hiçbir yerde saklanmaz; content/erisim.yaml'da yalnızca
 * özeti (SHA-256) durur, bu yüzden dosya herkese açık olsa da kod çıkarılamaz. Kod, doğrulanınca
 * tarayıcıya httpOnly çerez olarak yazılır ve her istekte yeniden kontrol edilir; özeti dosyadan
 * silinen kod hemen geçersiz olur. Kod üretmek için: npm run kod-uret -- <adet> "<not>"
 */

export const ERISIM_CEREZI = "vr_erisim";
export const URUNLER = ["beyanname", "aile"] as const;
export type Urun = (typeof URUNLER)[number];

const DosyaSemasi = z.strictObject({
  kodlar: z
    .array(
      z.strictObject({
        ozet: z.string().regex(/^[0-9a-f]{64}$/),
        urunler: z.array(z.enum(URUNLER)).min(1),
        not: z.string().optional(),
        tarih: z.string().optional(),
      }),
    )
    .nullish()
    .transform((k) => k ?? []),
});

export function kodNormalle(kod: string): string {
  return kod.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** scripts/kod-uret.mjs ile aynı hesap. */
export function kodOzeti(kod: string): string {
  return createHash("sha256").update(`vefatrehberi:${kodNormalle(kod)}`).digest("hex");
}

export function kodlariYukle(dosya = path.join(process.cwd(), "content", "erisim.yaml")) {
  const s = DosyaSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")) ?? {});
  if (!s.success) throw new Error(`İçerik hatası (content/erisim.yaml):\n${z.prettifyError(s.error)}`);
  return s.data.kodlar;
}

export function kodUrunleri(kod: string, kodlar = kodlariYukle()): Urun[] {
  if (kodNormalle(kod).length < 8) return [];
  const ozet = kodOzeti(kod);
  return kodlar.find((k) => k.ozet === ozet)?.urunler ?? [];
}

export async function erisimVar(urun: Urun): Promise<boolean> {
  const kod = (await cookies()).get(ERISIM_CEREZI)?.value;
  return !!kod && kodUrunleri(kod).includes(urun);
}
