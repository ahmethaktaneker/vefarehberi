/**
 * Soru akışı (Brief 5.2). Sorular arayüz metnidir; hukuki içerik değildir.
 * Brief'teki 4. soru (yakınlık) hiçbir kuralda kullanılmadığı için kaldırıldı (28.09.2026).
 * Seçenek değerleri content/ içindeki koşullarda kullanılır, değiştirilirse içerik de güncellenmeli.
 */

export type CevapDegeri = string | string[];
export type Cevaplar = Record<string, CevapDegeri | undefined>;

export type Secenek = {
  deger: string;
  etiket: string;
  /** Çoklu seçimde diğerleriyle birlikte seçilemez ("Hiçbiri", "Bilmiyorum"). */
  tekBasina?: boolean;
};

type SoruTemel = {
  id: string;
  soru: string;
  aciklama?: string;
  /** Verilmezse soru her zaman gösterilir. */
  goster?: (c: Cevaplar) => boolean;
};

export type Soru =
  | (SoruTemel & { tip: "tarih" })
  | (SoruTemel & { tip: "tek" | "coklu"; secenekler: Secenek[] });

const BILMIYORUM: Secenek = { deger: "bilmiyorum", etiket: "Bilmiyorum", tekBasina: true };
const HICBIRI: Secenek = { deger: "hicbiri", etiket: "Hiçbiri", tekBasina: true };

export const SORULAR: Soru[] = [
  {
    id: "vefat_tarihi",
    tip: "tarih",
    soru: "Vefat tarihi nedir?",
    aciklama: "Son tarihleri bu tarihe göre hesaplıyoruz.",
  },
  {
    id: "vefat_yeri",
    tip: "tek",
    soru: "Vefat nerede gerçekleşti?",
    secenekler: [
      { deger: "turkiye", etiket: "Türkiye'de" },
      { deger: "yurtdisi", etiket: "Yurtdışında" },
    ],
  },
  {
    id: "mirasci_yeri",
    tip: "tek",
    soru: "Siz veya mirasçıların çoğu nerede yaşıyor?",
    secenekler: [
      { deger: "turkiye", etiket: "Türkiye'de" },
      { deger: "yurtdisi", etiket: "Yurtdışında" },
      { deger: "karisik", etiket: "Bir kısmı Türkiye'de, bir kısmı yurtdışında" },
    ],
  },
  {
    id: "calisma_durumu",
    tip: "tek",
    soru: "Vefat eden kişinin çalışma durumu neydi?",
    secenekler: [
      { deger: "emekli", etiket: "Emekliydi" },
      { deger: "calisiyordu", etiket: "Çalışıyordu (sigortalı)" },
      { deger: "kamu", etiket: "Kamu görevlisiydi" },
      { deger: "esnaf", etiket: "Esnaf veya serbest çalışandı" },
      { deger: "calismiyordu", etiket: "Çalışmıyordu" },
      BILMIYORUM,
    ],
  },
  {
    id: "sosyal_guvenlik",
    tip: "tek",
    soru: "Hangi sosyal güvenlik kurumuna bağlıydı?",
    goster: (c) => c.calisma_durumu !== "calismiyordu",
    secenekler: [
      { deger: "4a", etiket: "SGK (4a)" },
      { deger: "4b", etiket: "Bağ-Kur (4b)" },
      { deger: "4c", etiket: "Emekli Sandığı (4c)" },
      BILMIYORUM,
    ],
  },
  {
    id: "hak_sahipleri",
    tip: "coklu",
    soru: "Geride eşi veya bakmakla yükümlü olduğu çocuğu var mı?",
    aciklama: "Birden fazla seçebilirsiniz.",
    secenekler: [
      { deger: "esi_var", etiket: "Eşi var" },
      { deger: "cocuk_18_alti", etiket: "18 yaşından küçük çocuğu var" },
      { deger: "ogrenci_cocuk", etiket: "Öğrenci çocuğu var" },
      HICBIRI,
      BILMIYORUM,
    ],
  },
  {
    id: "varliklar",
    tip: "coklu",
    soru: "Aşağıdakilerden hangileri var?",
    aciklama: "Birden fazla seçebilirsiniz. Tutar sormuyoruz.",
    secenekler: [
      { deger: "ev_arsa", etiket: "Ev veya arsa (Türkiye'de)" },
      { deger: "baska_sehir_tasinmaz", etiket: "Başka şehirde taşınmaz" },
      { deger: "arac", etiket: "Araç" },
      { deger: "banka", etiket: "Banka hesabı" },
      { deger: "kredi", etiket: "Kredi" },
      { deger: "kredi_karti", etiket: "Kredi kartı" },
      { deger: "sirket", etiket: "Şirket veya ortaklık" },
      { deger: "yurtdisi_mal", etiket: "Yurtdışında mal" },
      HICBIRI,
      BILMIYORUM,
    ],
  },
  {
    id: "borc",
    tip: "tek",
    soru: "Vefat eden kişinin borcu olabilir mi?",
    secenekler: [
      { deger: "evet", etiket: "Evet" },
      { deger: "hayir", etiket: "Hayır" },
      BILMIYORUM,
    ],
  },
  {
    id: "abonelikler",
    tip: "coklu",
    soru: "Üzerine kayıtlı abonelik ve sözleşmeler hangileri?",
    aciklama: "Birden fazla seçebilirsiniz.",
    secenekler: [
      { deger: "cep", etiket: "Cep telefonu" },
      { deger: "sabit_internet", etiket: "Sabit hat veya internet" },
      { deger: "elektrik", etiket: "Elektrik" },
      { deger: "su", etiket: "Su" },
      { deger: "dogalgaz", etiket: "Doğalgaz" },
      { deger: "dijital", etiket: "Dijital abonelikler" },
      { deger: "kira", etiket: "Kira sözleşmesi (kirada oturuyordu)" },
      HICBIRI,
      BILMIYORUM,
    ],
  },
  {
    id: "mirasci_sayisi",
    tip: "tek",
    soru: "Tahminen kaç mirasçı var?",
    secenekler: [
      { deger: "1", etiket: "1" },
      { deger: "2_3", etiket: "2-3" },
      { deger: "4_arti", etiket: "4 veya daha fazla" },
      BILMIYORUM,
    ],
  },
  {
    id: "mirascilik_belgesi",
    tip: "tek",
    soru: "Mirasçılık belgesi (veraset ilamı) alındı mı?",
    secenekler: [
      { deger: "evet", etiket: "Evet" },
      { deger: "hayir", etiket: "Hayır" },
      BILMIYORUM,
    ],
  },
];

/** Soru id → izin verilen değerler. İçerik koşullarını doğrulamak için kullanılır. */
export const SORU_DEGERLERI: Record<string, string[] | "tarih"> = Object.fromEntries(
  SORULAR.map((s) => [s.id, s.tip === "tarih" ? "tarih" : s.secenekler.map((o) => o.deger)]),
);

/** Mevcut cevaplara göre gösterilecek sorular. */
export function gorunenSorular(c: Cevaplar): Soru[] {
  return SORULAR.filter((s) => !s.goster || s.goster(c));
}

/** Gizlenen sorulara ait eski cevapları atar (ör. çalışma durumu sonradan değiştiyse). */
export function gecerliCevaplar(c: Cevaplar): Cevaplar {
  const ids = new Set(gorunenSorular(c).map((s) => s.id));
  return Object.fromEntries(Object.entries(c).filter(([k]) => ids.has(k)));
}

export function cevaplandi(s: Soru, c: Cevaplar): boolean {
  const v = c[s.id];
  return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v !== "";
}

/** Tüm görünen sorular cevaplandı mı? */
export function akisTamam(c: Cevaplar): boolean {
  return gorunenSorular(c).every((s) => cevaplandi(s, c));
}
