# Doğrulanacaklar listesi (avukat / mali müşavir için)

`content/` altındaki tüm maddeler şu an `dogrulandi: false` durumundadır ve sitede
"Kontrol ediliyor" rozetiyle gösterilir. Kontrol edilen madde `dogrulandi: true` yapılır ve
`son_kontrol` tarihi güncellenir.

İnternet araştırması (28.09.2026) bazı maddeleri resmi kaynaklarla destekledi, ancak bu bir
hukuk uzmanı kontrolü yerine geçmez; bu yüzden hiçbir madde `true` yapılmadı.

## 28.09.2026 internet araştırması: resmi kaynakla desteklenenler

| Konu | Bulgu | Kaynak |
|---|---|---|
| Veraset beyannamesi süreleri | Ölüm TR: mirasçı TR 4 ay, yurtdışı 6 ay. Ölüm yurtdışı: mirasçı TR 6 ay, aynı ülke 4 ay, başka ülke 8 ay. **Kod güncellendi** (önceden ölüm yurtdışı + mirasçı TR için 4 ay gösteriliyordu, doğrusu 6 ay). | VİVK m.9, mevzuat.gov.tr |
| Taksit ve tapu tescili | 3 yıl, mayıs-kasım, 6 taksit; tescil tahakkuk beklenmeden, devir için ilişik kesme belgesi. Brief doğru. | VİVK m.19, mevzuat.gov.tr |
| Cenaze ödeneği | 6.398 TL (2026). Şartlar: iş kazası/meslek hastalığı, emekli aylığı alırken ölüm veya en az 360 gün prim. Sıra: eş, çocuklar, anne-baba, kardeşler. 5 yıl zamanaşımı. **Metne eklendi.** | sgk.gov.tr |
| Emekli Sandığı ölüm yardımı | SGK sayfası 26.369,55 TL'yi yalnızca 01.01–30.06.2026 için veriyor. Temmuz tutarı resmi kaynakta bulunamadı. Sitede tutar gösterilmiyor. | sgk.gov.tr |
| Ölüm belgesini kim düzenler | Sağlık kurumu; kurum dışında belediye tabibi, yoksa TSM hekimi, yoksa aile hekimi. 10 gün içinde nüfusa elektronik bildirim. **Metin düzeltildi.** | nvi.gov.tr |
| Yurtdışında ölüm | Dış temsilciliğe bildirilir ve tescil edilir. **Yeni adım eklendi.** Cenaze nakil belgesinin hangi temsilciliğe başvurulacağı konusunda temsilcilikler farklı bilgi veriyor (Milano: ülkedeki tüm temsilcilikler; Roma: yalnızca Roma); metinde "en yakın temsilciliğe sorun" deniyor. | nvi.gov.tr, konsolosluk.gov.tr, mfa.gov.tr |
| Mirasçılık belgesi ve e-Devlet | e-Devlet hizmeti (Adalet Bakanlığı) yalnızca sorgulama yapıyor; yeni belge noter veya sulh hukuk mahkemesinden. Noter; tartışmalı mirasçılık, nüfus kaydıyla tespit edilemeyen soybağı ve yabancı mirasçı hâllerinde düzenleyemez (Noterlik K. m.71/B). **Metin düzeltildi.** | turkiye.gov.tr, hukuk bürosu yazıları |
| Reddi miras süresinin başlangıcı | Yasal mirasçı: ölümü öğrendiği tarih (mirasçılığını sonra öğrendiğini ispat ederse o tarih); atanmış mirasçı: tasarrufun bildirildiği tarih. **Metne eklendi.** | TMK m.606 (hukuk bürosu yazıları üzerinden; kanun metni ayrıca okunmalı) |

## Proje sahibinin saha deneyimi (28.09.2026)

- **İnternet Vergi Dairesi'nden veraset beyannamesi verilemiyor.** GİB kılavuzu elektronik beyanı
  anlatıyor; sitede artık "kılavuza göre mümkün, uygulamada verilemediği görülüyor, vergi dairesine
  giderek vermeyi planlayın" deniyor. Vergi uzmanına sorulacak (bkz. KURUM_ARASTIRMASI.md).
- **Noterlerin çoğu mirasçılık belgesi düzenlemiyor veya işlemi bilmiyor.** "Gitmeden önce noteri
  arayın; yapmıyorsa Sulh Hukuk Mahkemesi" notu eklendi.
- Beyannamenin verileceği yer kanundan eklendi: vefat edenin ikametgâhının vergi dairesi (VİVK m.6);
  yurtdışındaki mirasçılar konsolosluğa da verebilir, ayrı veya birlikte verilebilir (VİVK m.8).

## Hâlâ açık konular

1. **Emekli Sandığı ölüm yardımı Temmuz-Aralık 2026 tutarı.** Resmi olmayan bir hesap:
   (1500 + 8500) × 2 × 1,575512 (Temmuz 2026 memur katsayısı) = 31.510,24 TL. Formül
   memurlar.net (2021), katsayı mevzuatinyeri.com'dan; SGK'dan teyit edilmeden kullanılmamalı.
2. **Reddi miras süresi** kanun metninden (TMK m.606) doğrudan okunmalı; ayrıca arayüzde vefat
   tarihinden hesaplamak ve not düşmek yeterli mi?
3. **Soru akışı ayrımı:** "Yurtdışında" cevabı, mirasçının vefatın olduğu ülkede mi başka bir
   ülkede mi olduğunu ayırt etmiyor; bu durumda 4 ay (en kısa) gösteriliyor. Bir alt soru eklensin mi?
4. **Cenaze ödeneği** her kullanıcıya gösteriliyor (şartlar metinde). Çalışma durumuna göre
   gizlenmeli mi?
5. **Uyarı metinleri** Avukatlık Kanunu m.35 açısından yeterli mi? (Brief 16.3)
6. **Kullanıcı deneyimi notları** (Ekşi Sözlük, Şikayetvar vb.) doğası gereği resmi kaynakla
   doğrulanamaz; "Kullanıcı deneyimi" etiketiyle ayrı gösteriliyor.
7. Brief'teki "ayrıntılı ölüm belgesi için birkaç gün sonra yeniden başvurmak gerekebilir" ipucu
   kaynaksız olduğu için kaldırıldı.

## Dilekçe taslakları ve rehber sayfaları (Faz 2a)

- `sablonlar/*.md`: banka bakiye yazısı, abonelik iptali ve güvence bedeli iadesi, otomatik ödeme
  iptali. Dil ve içerik avukat tarafından kontrol edilmeli (Avukatlık K. m.35 sınırı: genel örnek metin).
  Reddi miras için bilinçli olarak şablon yok (Brief 9).
- `sayfalar/ilk-48-saat.md`, `sayfalar/yurtdisi.md`: tüm metin. 188 cenaze hattı birkaç belediyenin
  kendi sitesinden doğrulandı; kapsam belediyeye göre değişiyor.

## Dosyalar

- `adimlar/*.yaml`: 26 adım
- `kurumlar/*.yaml`: 12 kurum (bkz. KURUM_ARASTIRMASI.md)
- `parametreler.yaml`: tutarlar ve süreler
- `belgeler.yaml`: belge adları
- `avukat_uyarilari.yaml`: "avukata danışın" uyarıları
