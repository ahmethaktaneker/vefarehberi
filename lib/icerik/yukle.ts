import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import {
  AdimSemasi,
  AvukatUyarisiSemasi,
  BelgeSemasi,
  ParametrelerSemasi,
  type Icerik,
} from "@/lib/icerik/sema";

/**
 * content/ klasörünü okur ve doğrular. Sunucuda (build sırasında) çalışır.
 * Geçersiz içerik hata fırlatır; böylece build kırılır.
 */

const ICERIK_KLASORU = path.join(process.cwd(), "content");

function yamlOku(dosya: string): unknown {
  return parse(fs.readFileSync(dosya, "utf8"));
}

function dogrula<T>(sema: z.ZodType<T>, veri: unknown, dosya: string): T {
  const sonuc = sema.safeParse(veri);
  if (!sonuc.success) {
    throw new Error(`İçerik hatası (${path.relative(process.cwd(), dosya)}):\n${z.prettifyError(sonuc.error)}`);
  }
  return sonuc.data;
}

let onbellek: Icerik | undefined;

export function icerikYukle(klasor: string = ICERIK_KLASORU): Icerik {
  if (klasor === ICERIK_KLASORU && onbellek) return onbellek;

  const adimKlasoru = path.join(klasor, "adimlar");
  const adimlar = fs
    .readdirSync(adimKlasoru)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .flatMap((f) => {
      const dosya = path.join(adimKlasoru, f);
      return dogrula(z.array(AdimSemasi), yamlOku(dosya), dosya);
    });

  const belgeDosyasi = path.join(klasor, "belgeler.yaml");
  const belgeListesi = dogrula(z.array(BelgeSemasi), yamlOku(belgeDosyasi), belgeDosyasi);

  const uyariDosyasi = path.join(klasor, "avukat_uyarilari.yaml");
  const avukatUyarilari = dogrula(z.array(AvukatUyarisiSemasi), yamlOku(uyariDosyasi), uyariDosyasi);

  const parametreDosyasi = path.join(klasor, "parametreler.yaml");
  const parametreler = dogrula(ParametrelerSemasi, yamlOku(parametreDosyasi), parametreDosyasi);

  // Çapraz kontroller: tekil id'ler, var olan belge referansları.
  const tekrar = adimlar.map((a) => a.id).filter((id, i, dizi) => dizi.indexOf(id) !== i);
  if (tekrar.length) throw new Error(`İçerik hatası: tekrarlanan adım id'leri: ${tekrar.join(", ")}`);

  const belgeler = Object.fromEntries(belgeListesi.map((b) => [b.id, b]));
  for (const a of adimlar) {
    for (const b of a.belgeler) {
      if (!belgeler[b]) throw new Error(`İçerik hatası: "${a.id}" adımı bilinmeyen belgeye bakıyor: ${b}`);
    }
  }

  const icerik = { adimlar, belgeler, avukatUyarilari, parametreler };
  if (klasor === ICERIK_KLASORU) onbellek = icerik;
  return icerik;
}
