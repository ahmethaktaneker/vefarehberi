import { z } from "zod";
import type { Kosul } from "@/lib/kurallar/kosul";
import { SORU_DEGERLERI } from "@/lib/sorular";

/**
 * content/ klasöründeki YAML dosyalarının şeması (Brief 6.1, 6.2).
 * Kaynağı, son kontrol tarihi veya doğrulama durumu olmayan içerik geçersizdir.
 */

const tarih = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD biçiminde olmalı");

/** Her içerik maddesinde zorunlu doğruluk alanları (Brief 0.5, 4.5). */
const dogrulukAlanlari = {
  kaynak: z.array(z.string().min(1)).min(1, "En az bir kaynak gerekli"),
  son_kontrol: tarih,
  dogrulandi: z.boolean(),
};

const alanKosulu = z
  .record(z.string(), z.union([z.string(), z.array(z.string()).min(1)]))
  .superRefine((k, ctx) => {
    for (const [soruId, deger] of Object.entries(k)) {
      const izinli = SORU_DEGERLERI[soruId];
      if (!izinli || izinli === "tarih") {
        ctx.addIssue({ code: "custom", message: `Koşulda bilinmeyen soru: ${soruId}` });
        continue;
      }
      for (const v of Array.isArray(deger) ? deger : [deger]) {
        if (!izinli.includes(v)) {
          ctx.addIssue({ code: "custom", message: `${soruId} için geçersiz değer: ${v}` });
        }
      }
    }
  });

export const KosulSemasi: z.ZodType<Kosul> = z.lazy(() =>
  z.union([
    z.strictObject({ all: z.array(KosulSemasi).min(1) }),
    z.strictObject({ any: z.array(KosulSemasi).min(1) }),
    z.strictObject({ not: KosulSemasi }),
    alanKosulu,
  ]),
) as z.ZodType<Kosul>;

export const ZAMAN_GRUPLARI = ["ilk_hafta", "ilk_ay", "ilk_3_ay", "ilk_4_ay", "sonra"] as const;
export const KATEGORILER = ["son_tarih", "odeme", "borc_risk", "resmi", "kurum", "belge"] as const;
export const SURE_PARAMETRELERI = [
  "reddi_miras_ay",
  "veraset_beyanname_ay_tr",
  "veraset_beyanname_ay_yurtdisi",
] as const;

const SonTarihSemasi = z.strictObject({
  baslangic: z.literal("vefat_tarihi"),
  sure: z.union([
    z.strictObject({ ay: z.number().int().positive() }),
    z.strictObject({ parametre: z.enum(SURE_PARAMETRELERI) }),
    /** Vefat yeri ve mirasçıların yerine göre değişen süre (Brief 6.3). */
    z.strictObject({ kural: z.literal("veraset_beyannamesi") }),
  ]),
  /** Süreyle ilgili genel not. */
  not: z.string().optional(),
  /** Süre kesin belirlenemediğinde (karmaşık kombinasyonlar) gösterilir. */
  belirsiz_not: z.string().optional(),
  /** Süre geçmişse gösterilir. */
  gecti_notu: z.string(),
});

const IpucuSemasi = z.strictObject({
  metin: z.string().min(1),
  /** "deneyim" ipuçları "Kullanıcı deneyimi" etiketiyle, resmi bilgiden ayrı gösterilir. */
  tur: z.enum(["genel", "deneyim"]),
});

export const AdimSemasi = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  baslik: z.string().min(1),
  kategori: z.enum(KATEGORILER),
  zaman_grubu: z.enum(ZAMAN_GRUPLARI),
  oncelik: z.enum(["kritik", "yuksek", "normal"]),
  kosul: KosulSemasi.optional(),
  /** Adım bir "Bilmiyorum" cevabı yüzünden gösteriliyorsa kartta not çıkar. */
  belirsizse: KosulSemasi.optional(),
  son_tarih: SonTarihSemasi.optional(),
  /** content/parametreler.yaml > cenaze_odenegi altındaki tutar anahtarı. */
  tutar: z.enum(["genel_sgk", "emekli_sandigi_4c"]).optional(),
  ne: z.string().min(1),
  neden: z.string().optional(),
  nereye: z.string().optional(),
  belgeler: z.array(z.string()).default([]),
  cevrimici: z.string().optional(),
  ipuclari: z.array(IpucuSemasi).default([]),
  uyari: z.string().optional(),
  baglantilar: z.array(z.strictObject({ ad: z.string(), url: z.url() })).default([]),
  ...dogrulukAlanlari,
  ucretli_icerik: z.boolean(),
});

export const BelgeSemasi = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  ad: z.string().min(1),
  ...dogrulukAlanlari,
});

export const AvukatUyarisiSemasi = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  kosul: KosulSemasi,
  metin: z.string().min(1),
  ...dogrulukAlanlari,
});

const TutarSemasi = z.strictObject({
  tutar: z.number().positive(),
  kaynak: z.string().min(1),
  /** "2026" (tüm yıl) veya "2026-01-01..2026-06-30" */
  gecerlilik: z.string().regex(/^(\d{4}|\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2})$/),
  not: z.string().optional(),
});

export const ParametrelerSemasi = z.strictObject({
  yil: z.number().int(),
  ...dogrulukAlanlari,
  cenaze_odenegi: z.strictObject({
    genel_sgk: TutarSemasi,
    emekli_sandigi_4c: TutarSemasi,
    zamanasimi_yil: z.number().int().positive(),
  }),
  /** Faz 2 hesaplayıcısında ayrıntılı şemaya kavuşacak. */
  veraset_vergisi: z.record(z.string(), z.unknown()),
  sureler: z.strictObject(
    Object.fromEntries(SURE_PARAMETRELERI.map((k) => [k, z.number().int().positive()])) as Record<
      (typeof SURE_PARAMETRELERI)[number],
      z.ZodNumber
    >,
  ),
});

export type Adim = z.infer<typeof AdimSemasi>;
export type Belge = z.infer<typeof BelgeSemasi>;
export type AvukatUyarisi = z.infer<typeof AvukatUyarisiSemasi>;
export type Parametreler = z.infer<typeof ParametrelerSemasi>;
export type ZamanGrubu = (typeof ZAMAN_GRUPLARI)[number];

export type Icerik = {
  adimlar: Adim[];
  belgeler: Record<string, Belge>;
  avukatUyarilari: AvukatUyarisi[];
  parametreler: Parametreler;
};
