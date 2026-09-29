import { z } from "zod";

/** content/beyanname.yaml: beyanname hazırlık aracının yardım metinleri ve ekleri. */
export const BeyannameIcerikSemasi = z.strictObject({
  kaynak: z.array(z.string()).min(1),
  son_kontrol: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dogrulandi: z.boolean(),
  vergi_dairesi: z.string(),
  cevrimici: z.string(),
  beyan_edilmeyenler: z.array(z.string()),
  tasinmaz: z.strictObject({
    deger_nasil: z.string(),
    ekler: z.array(z.string()),
    turler: z.array(z.strictObject({ id: z.string(), ad: z.string() })).min(1),
  }),
  digerleri: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z_]+$/),
        ad: z.string(),
        ornek: z.string(),
        deger_nasil: z.string(),
        ekler: z.array(z.string()),
      }),
    )
    .min(1),
  borclar: z.strictObject({
    aciklama: z.string(),
    turler: z.array(z.strictObject({ id: z.string(), ad: z.string(), ornek: z.string(), not: z.string() })).min(1),
    ekler: z.array(z.string()),
  }),
  her_zaman_ekler: z.array(z.string()),
});

export type BeyannameIcerik = z.infer<typeof BeyannameIcerikSemasi>;
