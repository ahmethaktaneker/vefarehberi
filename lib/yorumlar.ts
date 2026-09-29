import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";

/** content/yorumlar.yaml: izinle alınmış kullanıcı sözleri. */
const YorumlarSemasi = z.strictObject({
  yorumlar: z.array(z.strictObject({ metin: z.string().min(1), kim: z.string().min(1) })).default([]),
});

export type Yorum = z.infer<typeof YorumlarSemasi>["yorumlar"][number];

export function yorumlariYukle(dosya = path.join(process.cwd(), "content", "yorumlar.yaml")): Yorum[] {
  const s = YorumlarSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")) ?? {});
  if (!s.success) throw new Error(`İçerik hatası (content/yorumlar.yaml):\n${z.prettifyError(s.error)}`);
  return s.data.yorumlar;
}
