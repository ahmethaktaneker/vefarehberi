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

## KVKK metinleri (taslak, proje sahibinin isteğiyle avukat beklenmeden hazırlandı)

- `content/kvkk.yaml` (açık rıza metni) ve `content/sayfalar/aydinlatma-metni.md` KVKK m.10'daki
  başlıkları izleyen taslaklardır. **Veri sorumlusu adı ve iletişim e-postası eksik.**
- Kontrol edilecekler: yurt dışına aktarım dayanağı (m.9; veritabanı yurt dışında), 12 aylık saklama
  süresi, paket duyurusu e-postasının ticari elektronik ileti sayılıp sayılmadığı ve İYS kaydı gerekip
  gerekmediği, VERBİS kaydı gerekip gerekmediği.

## Arama motoru sayfaları (Faz 2c)

- `sayfalar/rehber/*.md` (8 sayfa) ve `ilk-48-saat`, `yurtdisi`, `veraset-vergisi-hesaplama` sayfalarının
  metinleri ve sık sorulan soru cevapları. Yalnızca bu dosyada daha önce kaynakla karşılaştırılan bilgiler
  kullanıldı; tutarlar `parametreler.yaml`'dan otomatik doldurulur.

## Yayın öncesi (proje sahibinin kararları, 28.09.2026)

- **"Kontrol ediliyor" rozetleri gizlendi** (`lib/marka.ts` > `KONTROL_ROZETLERI = false`). Brief 0.5 rozet
  istiyor; proje sahibi yayından önce avukat kontrolünü halledecek. Kontrol tamamlanmadan yayına alınırsa
  bu ayar yeniden değerlendirilmeli.
- `sozluk.yaml`: 21 terimin genel tanımı; avukat kontrolü gerekli.
- `sayfalar/hakkimizda.md`: proje sahibi kendi hikâyesini ekleyebilir (dosyada yorum satırıyla yer ayrıldı).
- Brief'teki 4. soru (yakınlık) hiçbir kuralda kullanılmadığı için kaldırıldı; akış 11 soru.

## Dosyalar

- `adimlar/*.yaml`: 26 adım
- `kurumlar/*.yaml`: 12 kurum (bkz. KURUM_ARASTIRMASI.md)
- `parametreler.yaml`: tutarlar ve süreler
- `belgeler.yaml`: belge adları
- `avukat_uyarilari.yaml`: "avukata danışın" uyarıları

## Enerji, doğalgaz, su şirketleri (29.09.2026 eklendi)

- GDZ Elektrik, İzmirgaz, ASKİ, İZSU: sitelerinde vefata özel resmi metin bulunamadı; bilgiler kullanıcı deneyimi ve haberlerden. Kurumlara sorulmalı.
- İZSU "2 ay içinde devir, yoksa iptal" kuralı ve DASK şartı: İZSU'dan teyit edilmeli.
- "Diğer iller" genel bilgi kartları (elektrik, doğalgaz, su): avukat kontrolüne sunulmalı.

## Beyanname hazırlık aracı (29.09.2026 eklendi, content/beyanname.yaml)

- Araç değerlemesi: kanun "rayiç bedel" diyor; kasko değer listesinin kullanıldığı uygulamadan aktarılıyor. Vergi dairesine sorulmalı.
- Sigorta ödemelerinin hangilerinin beyan edileceği: GİB kılavuzunda sigorta sayılıyor ama ayrıntı yok.
- Borçların mirasçılara bölünmesi: araç borçları toplamdan düşüp kalanı paylara bölüyor (basitleştirme). Mali müşavire sorulmalı.
- Avukata sorulacak: "Kullanıcının kendi beyannamesini hazırlamasına yardım eden bir yazılım, 3568 s. Kanun'daki mali müşavirlik işi sayılır mı?"

## Hesaplayıcılar ve yeni araçlar (29.09.2026)

- Miras payı: büyük ana-baba zümresi hesaplanmıyor; evlatlık ve tanınmış çocuk "çocuk" sayılıyor (TMK m.498, 500). Avukat kontrol etmeli.
- Ölüm aylığı: anne-babanın "toplam %25"i ikisi de hak kazanırsa eşit bölünüyor varsayıldı; biri 65 yaş üstü, diğeri değilse durum sadeleştirildi. Çocuğa %50 kuralı "eş aylık almıyorsa ya da çocuk başka ebeveyndense" olarak uygulandı. SGK'ya / avukata sorulmalı.
- Kira adımı: konutta bildirim süresi 3 ay (TBK m.329); fesihin mirası kabul sayılıp sayılmayacağı avukata sorulmalı.
- Reddi miras tablosu: karar vermiyor, yalnızca karşılaştırıyor. "Borca batık miras" açıklaması avukat kontrolüne.
- Kurum ziyaret sayfaları: "gişede şöyle diyebilirsiniz" cümleleri genel; kurumlara göre değişebilir.

## Tutarlar (29.09.2026)

- Emekli Sandığı ölüm yardımı Temmuz-Aralık 2026: 29.934,73 TL alt sınır, memur aylık katsayısıyla hesaplandı (proje sahibi). SGK tutar sayfası güncellenince teyit et (content/parametreler.yaml).

## Adım incelemesi (29.09.2026)

- ✓ Kıdem tazminatı, ölüm aylığında geriye dönük ödeme (5510 / 5434 farkı) ve tapu intikalinde döner sermaye / DASK: proje sahibi resmi kaynaklardan (ÇSGB, Resmî Gazete, SGK, TKGM) teyit etti (29.09.2026); metinler buna göre güncellendi. Avukat kontrolü yine de önerilir.
