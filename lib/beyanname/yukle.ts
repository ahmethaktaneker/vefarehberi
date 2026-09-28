import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { BeyannameIcerikSemasi, type BeyannameIcerik } from "@/lib/beyanname/sema";

export function beyannameIcerikYukle(dosya = path.join(process.cwd(), "content", "beyanname.yaml")): BeyannameIcerik {
  const s = BeyannameIcerikSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")));
  if (!s.success) throw new Error(`İçerik hatası (content/beyanname.yaml):\n${z.prettifyError(s.error)}`);
  return s.data;
}
