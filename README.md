# Vefa Rehberi

Vefat sonrası işlemler, adım adım. Ürün tanımı ve kurallar: [PROJE_BRIEF.md](PROJE_BRIEF.md).

## Kurulum

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # birim testleri
npm run build    # üretim derlemesi
```

## Önemli dosyalar

- `lib/marka.ts`: `URUN_ADI`, `URUN_ALT_BASLIK`, kanonik adres, `YAYINDA` anahtarı.
  `YAYINDA = false` iken site arama motorlarına kapalıdır (noindex + robots.txt).
- `content/`: tüm içerik (adımlar, kurumlar, şablonlar, tutarlar). Kodun içine içerik yazılmaz.
- `app/globals.css`: renkler ve tasarım temeli.

## İçerik güncelleme takvimi

- **Her yıl Ocak ve Temmuz:** `content/parametreler.yaml` içindeki tutarları (cenaze ödeneği,
  Emekli Sandığı ölüm yardımı, veraset vergisi istisnaları ve dilimleri) resmi kaynaklardan kontrol et
  ve `son_kontrol` tarihlerini güncelle.
- Avukat kontrolünden geçen maddelerde `dogrulandi: true` yapılır.
