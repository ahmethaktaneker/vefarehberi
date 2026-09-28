# Doğrulanacaklar listesi (avukat / mali müşavir için)

`content/` altındaki tüm maddeler şu an `dogrulandi: false` durumundadır ve sitede
"Kontrol ediliyor" rozetiyle gösterilir. Kontrol edilen madde `dogrulandi: true` yapılır ve
`son_kontrol` tarihi güncellenir.

## Öncelikli açık konular

1. **Emekli Sandığı ölüm yardımı tutarı:** `parametreler.yaml` içindeki 26.369,55 TL yalnızca
   30.06.2026'ya kadar geçerli. Temmuz 2026 tutarı bulunana kadar sitede tutar gösterilmiyor.
2. **Veraset beyannamesi süreleri:** Yalnızca iki durum tanımlı (TR/TR = 4 ay, vefat TR ve
   mirasçılar yurtdışı = 6 ay). Vefatın yurtdışında olduğu ve "karışık" durumlarda en kısa süre
   (4 ay) "süre farklı olabilir" notuyla gösteriliyor. 8 ay ihtimali (Brief 16.4) kontrol edilmeli.
3. **Reddi miras süresinin başlangıcı:** Arayüzde "ölümü öğrenme tarihinden başlar, çoğu durumda
   vefat tarihidir" deniyor, hesap vefat tarihinden yapılıyor (Brief 16.5).
4. **Mirasçılık belgesi e-Devlet'ten sıfırdan alınabilir mi?** Kaynaklar çelişkili; metinde
   "kontrol ediliyor" deniyor (Brief 16.2).
5. **Ölüm belgesi adımı:** Brief'te ayrı bir kaynak yok (`1_ilk_hafta.yaml > olum_belgesi`).
6. **Cenaze ödeneği:** Kimlerin yararlanabileceği (hak sahipliği şartları) brief'te yok; adım
   her kullanıcıya "SGK'dan teyit edin" notuyla gösteriliyor.
7. **Yurtdışında vefat:** Ölüm belgesi ve diğer ilk adımlar için brief'te bilgi yok; bu durumda
   "Ölüm belgesini alın" adımı gösterilmiyor.
8. **Uyarı metinleri:** Avukatlık Kanunu m.35 açısından yeterli mi? (Brief 16.3)

## Dosyalar

- `adimlar/1_ilk_hafta.yaml`, `2_ilk_ay.yaml`, `3_ilk_3_ay.yaml`, `4_ilk_4_ay.yaml`: 17 adım
- `parametreler.yaml`: tutarlar ve süreler
- `belgeler.yaml`: belge adları
- `avukat_uyarilari.yaml`: "avukata danışın" uyarıları
