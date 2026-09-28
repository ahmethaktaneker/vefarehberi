import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";

/** content/kvkk.yaml: veri sorumlusu ve açık rıza metinleri (taslak, avukat kontrolü bekliyor). */
const KvkkSemasi = z.strictObject({
  veri_sorumlusu: z.string().min(1),
  iletisim_eposta: z.string().min(1),
  acik_riza: z.strictObject({
    paket_ilgi: z.strictObject({ surum: z.string().min(1), metin: z.string().min(1) }),
  }),
  kaynak: z.array(z.string()).min(1),
  son_kontrol: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dogrulandi: z.boolean(),
});

export type Kvkk = z.infer<typeof KvkkSemasi>;

export function kvkkYukle(dosya = path.join(process.cwd(), "content", "kvkk.yaml")): Kvkk {
  const s = KvkkSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")));
  if (!s.success) throw new Error(`İçerik hatası (content/kvkk.yaml):\n${z.prettifyError(s.error)}`);
  return s.data;
}

/** Metindeki {{veri_sorumlusu}} ve {{iletisim_eposta}} yer tutucularını doldurur. */
export function kvkkDoldur(metin: string, k: Kvkk): string {
  return metin.replaceAll("{{veri_sorumlusu}}", k.veri_sorumlusu).replaceAll("{{iletisim_eposta}}", k.iletisim_eposta);
}
