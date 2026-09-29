# Vefat Rehberi

Vefat sonrası işlemler, adım adım.

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

## Kullanıcı yorumlarını yayınlama

1. Liste sayfasındaki deneyim kutusundan gelen e-postalarda "yayınlanmasına izin veriyorum" cümlesi olanlar yayınlanabilir; olmayanlar yalnızca geri bildirimdir.
2. Yorumu kısaltmak gerekirse anlamını değiştirmeden kısaltın ve kişiye son hâlini onaylatın.
3. `content/yorumlar.yaml` dosyasına `metin`, `kim` (baş harf ve şehir) ve `puan` ile ekleyin. Uydurma ya da onaysız yorum eklenmez.
4. Genel memnuniyet, Umami'de "memnuniyet" olayındaki puanlardan izlenir.

## İçerik güncelleme takvimi

- **Her yıl Ocak ve Temmuz:** `content/parametreler.yaml` içindeki tutarları (cenaze ödeneği,
  Emekli Sandığı ölüm yardımı, veraset vergisi istisnaları ve dilimleri) resmi kaynaklardan kontrol et
  ve `son_kontrol` tarihlerini güncelle.
- Avukat kontrolünden geçen maddelerde `dogrulandi: true` yapılır.
- Rehber sayfalarındaki tutarlar ve oranlar (`{{cenaze_odenegi_genel}}`, `{{tarife_metni}}` vb.)
  `parametreler.yaml`'dan doldurulur; sayfa metinlerinde elle tutar yazmayın.

## İçerik klasörü

- `content/adimlar`, `content/kurumlar`: yapılacaklar ve kurum rehberi (YAML)
- `content/sablonlar`: dilekçe taslakları (Markdown + ön bilgi)
- `content/sayfalar`, `content/sayfalar/rehber`: rehber ve arama motoru sayfaları
- `content/paket.yaml`, `content/kvkk.yaml`: Takip Paketi ve KVKK metinleri
- `content/DOGRULANACAKLAR.md`: avukat / uzman kontrol listesi
- `content/KURUM_ARASTIRMASI.md`: kurumlardan toplanacak bilgiler
