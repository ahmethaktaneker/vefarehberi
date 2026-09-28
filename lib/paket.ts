import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { KosulSemasi } from "@/lib/icerik/sema";

/** content/paket.yaml: Takip Paketi ödeme isteği testi (Brief 10). */
export const PaketSemasi = z.strictObject({
  ad: z.string(),
  aciklama: z.string(),
  icerik: z.array(z.string()).min(1),
  fiyatlar: z.array(z.number().int().positive()).min(1),
  yakinda_metni: z.string(),
  eposta_yakinda_metni: z.string(),
  tetikleyiciler: z.array(
    z.strictObject({
      id: z.string().regex(/^[a-z0-9_]+$/),
      /** Yoksa kodda hesaplanan özel tetikleyicidir (veraset_30_gun). */
      kosul: KosulSemasi.optional(),
      metin: z.string(),
    }),
  ),
});

export type Paket = z.infer<typeof PaketSemasi>;

export function paketYukle(dosya = path.join(process.cwd(), "content", "paket.yaml")): Paket {
  const s = PaketSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")));
  if (!s.success) throw new Error(`İçerik hatası (content/paket.yaml):\n${z.prettifyError(s.error)}`);
  return s.data;
}
