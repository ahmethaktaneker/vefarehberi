import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";

/** content/paket.yaml: Beyanname ve Aile paketleri, ilgi testi (Brief 10). */
export const PaketSemasi = z.strictObject({
  paketler: z
    .array(
      z.strictObject({
        id: z.enum(["beyanname", "aile"]),
        ad: z.string(),
        aciklama: z.string(),
        icerik: z.array(z.string()).min(1),
      }),
    )
    .length(2),
  yakinda_metni: z.string(),
  eposta_yakinda_metni: z.string(),
});

export type Paket = z.infer<typeof PaketSemasi>;

export function paketYukle(dosya = path.join(process.cwd(), "content", "paket.yaml")): Paket {
  const s = PaketSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")));
  if (!s.success) throw new Error(`İçerik hatası (content/paket.yaml):\n${z.prettifyError(s.error)}`);
  return s.data;
}
