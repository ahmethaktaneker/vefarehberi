import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";

/**
 * Markdown içerikler: dilekçe şablonları (content/sablonlar) ve rehber sayfaları (content/sayfalar).
 * Her dosya "---" arasında YAML ön bilgi + Markdown gövdeden oluşur. Build sırasında okunur;
 * geçersiz içerik hata fırlatır.
 */

const ICERIK = path.join(process.cwd(), "content");
const tarih = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dogruluk = { kaynak: z.array(z.string().min(1)).min(1), son_kontrol: tarih, dogrulandi: z.boolean() };

export const SablonSemasi = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  baslik: z.string().min(1),
  aciklama: z.string().min(1),
  alanlar: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z0-9_]+$/),
        etiket: z.string().min(1),
        ornek: z.string().optional(),
        cok_satirli: z.boolean().optional(),
      }),
    )
    .min(1),
  ...dogruluk,
  ucretli_icerik: z.boolean(),
});

export const SayfaSemasi = z.strictObject({
  baslik: z.string().min(1),
  /** Arama motorları için sayfa başlığı; yoksa baslik kullanılır. */
  seo_baslik: z.string().optional(),
  aciklama: z.string().min(1),
  /** Sık sorulan sorular: sayfada gösterilir ve FAQPage yapılandırılmış verisi olarak eklenir. */
  sss: z.array(z.strictObject({ soru: z.string().min(1), cevap: z.string().min(1) })).default([]),
  ...dogruluk,
});

export type Sablon = z.infer<typeof SablonSemasi> & { govde: string };
export type Sayfa = z.infer<typeof SayfaSemasi> & { slug: string; govde: string };

function ayir(dosya: string): { onBilgi: unknown; govde: string } {
  const metin = fs.readFileSync(dosya, "utf8").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(metin);
  if (!m) throw new Error(`İçerik hatası (${dosya}): ön bilgi (---) bulunamadı`);
  return { onBilgi: parse(m[1]), govde: m[2].trim() };
}

function dogrula<T>(sema: z.ZodType<T>, veri: unknown, dosya: string): T {
  const s = sema.safeParse(veri);
  if (!s.success) throw new Error(`İçerik hatası (${dosya}):\n${z.prettifyError(s.error)}`);
  return s.data;
}

/** Şablon gövdesindeki {{alan}} yer tutucuları. */
export function yerTutucular(govde: string): string[] {
  return [...new Set([...govde.matchAll(/\{\{([a-z0-9_]+)\}\}/g)].map((m) => m[1]))];
}

export function sablonlariYukle(klasor = path.join(ICERIK, "sablonlar")): Sablon[] {
  return fs
    .readdirSync(klasor)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      const dosya = path.join(klasor, f);
      const { onBilgi, govde } = ayir(dosya);
      const s = dogrula(SablonSemasi, onBilgi, dosya);
      if (`${s.id}.md` !== f) throw new Error(`İçerik hatası (${dosya}): id dosya adıyla aynı olmalı`);
      const alanIdleri = s.alanlar.map((a) => a.id);
      const eksik = yerTutucular(govde).filter((y) => !alanIdleri.includes(y));
      const kullanilmayan = alanIdleri.filter((a) => !yerTutucular(govde).includes(a));
      if (eksik.length || kullanilmayan.length) {
        throw new Error(
          `İçerik hatası (${dosya}): tanımsız yer tutucu [${eksik.join(", ")}], kullanılmayan alan [${kullanilmayan.join(", ")}]`,
        );
      }
      return { ...s, govde };
    });
}

/** content/sayfalar/rehber altındaki arama motoru sayfalarının adları. */
export function rehberSluglari(klasor = path.join(ICERIK, "sayfalar", "rehber")): string[] {
  return fs
    .readdirSync(klasor)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
}

export function sayfaYukle(slug: string, klasor = path.join(ICERIK, "sayfalar")): Sayfa {
  const dosya = path.join(klasor, `${slug}.md`);
  const { onBilgi, govde } = ayir(dosya);
  return { ...dogrula(SayfaSemasi, onBilgi, dosya), slug, govde };
}

