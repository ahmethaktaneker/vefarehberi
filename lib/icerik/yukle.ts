import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import {
  AdimSemasi,
  AvukatUyarisiSemasi,
  BelgeSemasi,
  KurumSemasi,
  ParametrelerSemasi,
  SozlukSemasi,
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

  const kurumKlasoru = path.join(klasor, "kurumlar");
  const kurumlar = fs
    .readdirSync(kurumKlasoru)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .flatMap((f) => {
      const dosya = path.join(kurumKlasoru, f);
      return dogrula(z.array(KurumSemasi), yamlOku(dosya), dosya);
    });

  const sozlukDosyasi = path.join(klasor, "sozluk.yaml");
  const sozluk = dogrula(SozlukSemasi, yamlOku(sozlukDosyasi), sozlukDosyasi).terimler;

  const uyariDosyasi = path.join(klasor, "avukat_uyarilari.yaml");
  const avukatUyarilari = dogrula(z.array(AvukatUyarisiSemasi), yamlOku(uyariDosyasi), uyariDosyasi);

  const parametreDosyasi = path.join(klasor, "parametreler.yaml");
  const parametreler = dogrula(ParametrelerSemasi, yamlOku(parametreDosyasi), parametreDosyasi);

  // Çapraz kontroller: tekil id'ler, var olan belge referansları.
  for (const [ad, liste] of [["adım", adimlar], ["kurum", kurumlar]] as const) {
    const tekrar = liste.map((x) => x.id).filter((id, i, dizi) => dizi.indexOf(id) !== i);
    if (tekrar.length) throw new Error(`İçerik hatası: tekrarlanan ${ad} id'leri: ${tekrar.join(", ")}`);
  }

  const belgeler = Object.fromEntries(belgeListesi.map((b) => [b.id, b]));
  const belgeReferanslari = [
    ...adimlar.flatMap((a) => a.belgeler.map((b) => [a.id, b] as const)),
    ...adimlar.flatMap((a) => a.istege_bagli_belgeler.map((b) => [a.id, b.belge] as const)),
    ...kurumlar.flatMap((k) => k.islemler.flatMap((i) => i.belgeler.map((b) => [k.id, b] as const))),
  ];
  for (const [kimden, b] of belgeReferanslari) {
    if (!belgeler[b]) throw new Error(`İçerik hatası: "${kimden}" bilinmeyen belgeye bakıyor: ${b}`);
  }

  for (const a of adimlar) {
    if (a.sonuc_belge && !belgeler[a.sonuc_belge]) throw new Error(`İçerik hatası: "${a.id}" bilinmeyen sonuç belgesine bakıyor: ${a.sonuc_belge}`);
  }
  const adimIdleri = new Set(adimlar.map((a) => a.id));
  for (const a of adimlar) {
    for (const o of a.onceki) {
      if (!adimIdleri.has(o)) throw new Error(`İçerik hatası: "${a.id}" bilinmeyen önceki adıma bakıyor: ${o}`);
    }
  }

  const sablonIdleri = fs.readdirSync(path.join(klasor, "sablonlar")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
  for (const a of adimlar) {
    for (const s of a.sablonlar) {
      if (!sablonIdleri.includes(s)) throw new Error(`İçerik hatası: "${a.id}" bilinmeyen şablona bakıyor: ${s}`);
    }
  }

  const icerik = { adimlar, belgeler, kurumlar, sozluk, avukatUyarilari, parametreler };
  if (klasor === ICERIK_KLASORU) onbellek = icerik;
  return icerik;
}
