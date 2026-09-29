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

export const ARACLAR = ["beyanname_araci", "veraset_hesaplayici", "miras_payi", "olum_ayligi", "reddi_miras_tablosu"] as const;
export const KURUM_TURLERI = ["banka", "operator", "enerji", "dogalgaz", "su", "dijital", "diger"] as const;
/** Adımın yapıldığı yer ("Nereye gideceğim" görünümü). "dikkat": yapılacak iş değil, uyarı. */
export const YERLER = [
  "ev",
  "noter_mahkeme",
  "banka",
  "risk_merkezi",
  "sgk",
  "isveren",
  "kurumlar",
  "vergi_dairesi",
  "tapu",
  "saglik",
  "konsolosluk",
  "dikkat",
] as const;

export const ZAMAN_GRUPLARI = ["ilk_hafta", "ilk_ay", "ilk_3_ay", "ilk_4_ay", "sonra"] as const;
export const KATEGORILER = ["son_tarih", "odeme", "borc_risk", "resmi", "kurum", "belge"] as const;
export const SURE_PARAMETRELERI = [
  "reddi_miras_ay",
  "veraset_beyanname_ay_tr",
  "veraset_beyanname_ay_yurtdisi",
  "veraset_beyanname_ay_yurtdisi_baska_ulke",
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
  /** Sitedeki ilgili araç (kartta bağlantı olarak gösterilir). */
  /** Adımda gösterilecek araçlar. Tek değer ya da liste yazılabilir. */
  arac: z
    .union([z.enum(ARACLAR), z.array(z.enum(ARACLAR))])
    .optional()
    .transform((a) => (a === undefined ? [] : Array.isArray(a) ? a : [a])),
  /** content/sablonlar altındaki ilgili dilekçe taslaklarının id'leri. */
  sablonlar: z.array(z.string()).default([]),
  yer: z.enum(YERLER),
  /** Bu adım yapılınca elde edilen belge (belge listesinde kendiliğinden "hazır" sayılır). */
  sonuc_belge: z.string().optional(),
  /** Önce yapılması önerilen adımlar (kilit değil; "şimdi yapılacak" önerisinde ve etikette kullanılır). */
  onceki: z.array(z.string()).default([]),
  /** Kartta "ilgili kurumlar" olarak kurum rehberine bağlanacak kurum türleri. */
  kurum_turleri: z.array(z.enum(KURUM_TURLERI)).default([]),
  ...dogrulukAlanlari,
  ucretli_icerik: z.boolean(),
});

export const BelgeSemasi = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  ad: z.string().min(1),
  /** Belge listesinde gösterilen pratik not (ör. "4-5 kopya alın"). */
  not: z.string().optional(),
  ...dogrulukAlanlari,
});


/** Kurum rehberi (Brief 8). Resmi notlar ve kullanıcı deneyimleri ayrı tutulur. */
export const KurumSemasi = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  ad: z.string().min(1),
  tur: z.enum(KURUM_TURLERI),
  /** Hizmet verdiği bölge (ör. "İstanbul Avrupa Yakası"). Genel bilgi kartlarında "Diğer iller". */
  bolge: z.string().optional(),
  /** Belirli bir şirket değil, o türdeki tüm şirketler için genel bilgi kartı. */
  genel: z.boolean().default(false),
  /** Kurumun kendi sitesi. */
  web: z.url().optional(),
  /** Yalnızca kurumun kendi sayfasından teyit edilmiş iletişim bilgisi. */
  iletisim: z.string().optional(),
  /** Kurumun hangi cevaplarda gösterileceği. */
  kosul: KosulSemasi,
  islemler: z
    .array(
      z.strictObject({
        tip: z.enum(["devir", "iptal", "genel"]),
        kanal: z.array(z.string()).default([]),
        belgeler: z.array(z.string()).default([]),
        notlar_resmi: z.array(z.string()).default([]),
        notlar_deneyim: z.array(z.string()).default([]),
      }),
    )
    .min(1),
  guvence_bedeli_iadesi: z.array(z.string()).default([]),
  usulsuz_kullanim_uyarisi: z.boolean(),
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
  veraset_vergisi: z.strictObject({
    istisna: z.strictObject({
      /** Füruğ (çocuklar, evlatlıklar dahil) ve eşten her birinin hissesi için. */
      her_cocuk_ve_es: z.number().positive(),
      /** Füruğ yoksa eşin hissesi için. */
      furug_yoksa_es: z.number().positive(),
    }),
    /** Artan oranlı tarife. dilim: o dilimin genişliği (TL); son dilim null = kalan tüm tutar. */
    tarife_veraset: z
      .array(z.strictObject({ dilim: z.number().positive().nullable(), oran: z.number().min(0).max(1) }))
      .min(1)
      .refine((d) => d.at(-1)!.dilim === null && d.slice(0, -1).every((x) => x.dilim !== null), {
        message: "Yalnızca son dilim sınırsız (null) olmalı",
      }),
    odeme: z.string(),
    not: z.string().optional(),
  }),
  sureler: z.strictObject(
    Object.fromEntries(SURE_PARAMETRELERI.map((k) => [k, z.number().int().positive()])) as Record<
      (typeof SURE_PARAMETRELERI)[number],
      z.ZodNumber
    >,
  ),
});

export const SozlukSemasi = z.strictObject({
  ...dogrulukAlanlari,
  terimler: z
    .array(
      z.strictObject({
        terim: z.string().min(1),
        esanlamlilar: z.array(z.string().min(1)).default([]),
        aciklama: z.string().min(1),
      }),
    )
    .min(1),
});

export type Adim = z.infer<typeof AdimSemasi>;
export type Terim = z.infer<typeof SozlukSemasi>["terimler"][number];
export type Belge = z.infer<typeof BelgeSemasi>;
export type Kurum = z.infer<typeof KurumSemasi>;
export type KurumTuru = (typeof KURUM_TURLERI)[number];
export type AvukatUyarisi = z.infer<typeof AvukatUyarisiSemasi>;
export type Parametreler = z.infer<typeof ParametrelerSemasi>;
export type ZamanGrubu = (typeof ZAMAN_GRUPLARI)[number];
export type Yer = (typeof YERLER)[number];

export type Icerik = {
  adimlar: Adim[];
  belgeler: Record<string, Belge>;
  kurumlar: Kurum[];
  sozluk: Terim[];
  avukatUyarilari: AvukatUyarisi[];
  parametreler: Parametreler;
};
