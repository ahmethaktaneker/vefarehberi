# Proje Brief: Vefat Sonrası İşlemler Asistanı

> **Ürün adı:** **Vefa Rehberi** · Alt başlık: **"Vefat sonrası işlemler, adım adım"** (kodda tek bir sabitten okunacak: `URUN_ADI`, `URUN_ALT_BASLIK`).
> **Alan adları (satın alındı):** `vefarehberi.com` (ana site, Cloudflare Registrar), `vefarehberi.com.tr` (Turhost), `vefatislemleri.com` (Cloudflare Registrar, ana siteye yönlendirme).
> **Bu dosya kimin için:** Bu projeyi geliştirecek yapay zekâ kodlama asistanı (Claude Code) ve proje sahibi.
> **Durum:** Fikir doğrulama aşaması. Önce ücretsiz ürün, ödeme isteği test edilecek.

---

## 0. Claude Code için çalışma talimatı

1. Bu dosyanın tamamını oku. Kod yazmadan önce **Faz 1 için kısa bir uygulama planı** çıkar ve proje sahibine onaylat.
2. Her seferinde **tek bir fazda** çalış (bkz. Bölüm 15). Bir faz bitmeden sonrakine geçme.
3. Belirsiz bir şey olursa tahmin etme, sor. Özellikle hukuki içerik ve rakamlarda asla uydurma.
4. **İçerik (adımlar, süreler, tutarlar) kodun içine gömülmez.** Hepsi `content/` klasöründeki YAML dosyalarında durur. Bu dosyalar avukat tarafından kontrol edilecek.
5. Her içerik maddesinde `kaynak` ve `son_kontrol` alanı zorunlu. `dogrulandi: false` olan içerik arayüzde "kontrol ediliyor" rozetiyle gösterilir.
6. Kural motoru için birim testleri yaz. Tarih hesapları test edilmeden birleştirilmez.
7. Kullanıcıya ait hiçbir kişisel veriyi sunucuda saklama (Faz 1-3). Bkz. Bölüm 4.
8. Her faz sonunda: çalışan ürün, testler geçiyor, kısa bir "ne yaptım / ne kaldı" notu.

---

## 1. Ürün özeti

Bir yakınını kaybeden kişiye (genelde işleri üstlenen evlat ya da eş) **"şimdi ne yapmam gerekiyor, neyi kaçırıyorum?"** sorusunun **kişiye özel, sıralı ve son tarihli** cevabını veren, aileyle birlikte kullanılabilen ücretsiz bir web aracı.

**Neden var:**
- Türkiye'de yılda ~490 bin kişi vefat ediyor (TÜİK 2025: 491.684). Her biri bir ailenin bürokrasi sürecini başlatıyor.
- Devlet işlerin **parçalarını** dijitalleştirdi (e-Devlet varis hizmetleri, banka ve taşınmaz sorgulama, İnternet Vergi Dairesi'nden veraset beyannamesi) ama **bütünü birleştiren, sıralayan ve takip eden** bir araç yok.
- Kaçırılan süreler pahalıya patlıyor (reddi miras 3 ay, veraset beyannamesi 4 ay). Aileler hak ettikleri ödemeleri bilmiyor (cenaze ödeneği, ölüm aylığı, hayat sigortası).
- İnsanlar bilgiyi forumlardan parça parça topluyor ya da genel yapay zekâ sohbet araçlarına soruyor. Bu araçlar kişiye özel takip, güncel kurum bilgisi ve aile koordinasyonu sunmuyor.

**Tek cümlelik değer önerisi:** "Yakınınızı kaybettikten sonra yapmanız gerekenleri, son tarihleriyle ve size özel olarak, tek bir yerde görün. Hiçbir hakkı ve süreyi kaçırmayın."

---

## 2. Hedef kullanıcılar

| Kişi | Durum | Üründen beklentisi | Ödeme olasılığı |
|---|---|---|---|
| **Mehmet (38, İstanbul)** | Emekli babası vefat etti. Ev, başka şehirde arsa, araç, 2 banka, ihtiyaç kredisi. 3 kardeş. | Sıralı liste, belge listesi, kardeşlerle görev paylaşımı | Yüksek (karmaşık durum) |
| **Zeynep (29, Ankara)** | Annesi vefat etti. Mal yok, kredi kartı borcu olabilir. | Reddi miras süresi, borç kontrolü, hat kapatma | Düşük, ama ürünü paylaşır |
| **Ahmet (45, Almanya)** | Babası Türkiye'de vefat etti. Kardeşleri de yurtdışında. | Uzaktan ne yapılabilir, vekaletname, süreler | En yüksek |

**Tasarım notu:** Kullanıcı genelde 25-60 yaş, çoğunlukla **telefondan** girecek, yorgun ve yas içinde. Arayüz sade, büyük yazılı, sakin olmalı.

---

## 3. Kapsam

### Faz 1-3'te VAR (ücretsiz çekirdek)
- Soru akışı (8-12 soru) → kişiye özel yapılacaklar listesi.
- Zamana göre gruplanmış adımlar: İlk hafta / İlk ay / İlk 3 ay / İlk 4 ay / Sonra.
- Son tarih takvimi ve takvime ekleme (.ics dosyası).
- "Size çıkabilecek ödemeler" kontrolü (kaçırılan haklar).
- "Borç ve risk kontrolü" bölümü.
- Kurum rehberi (banka, operatör, abonelik kurumları).
- Temel dilekçe/başvuru taslakları (şablon tabanlı, yapay zekâ gerektirmez).
- Veraset ve intikal vergisi hesaplayıcısı.
- Paylaşım bağlantısı (aile üyeleri aynı listeyi görür, kendi cihazlarında işaretler).
- Ücretli paket için "yakında" düğmesi (ödeme isteği testi; Bölüm 10).
- 8-10 adet arama motoru için içerik sayfası (Bölüm 14).

### KAPSAM DIŞI (yapılmayacak)
- **Aile adına kurumlarla yazışmak, başvuru yapmak, işi takip etmek.** Aile işi kendisi yapar, biz hazırlarız. (Hukuki gerekçe: Bölüm 4.)
- Kişiye özel hukuki görüş ("mirası reddedin" gibi kesin yönlendirme).
- Avukata iş yönlendirip komisyon almak.
- Cenaze organizasyonu (belediyeler büyük ölçüde üstleniyor; sadece kısa bir "ilk 48 saat" rehber sayfası olacak).
- Miras paylaşımı anlaşmazlıklarını çözmek.
- Kullanıcı hesabı ve veritabanı (Faz 4'e kadar yok).

---

## 4. Hukuki ve etik ilkeler (tartışmaya kapalı)

1. **Bilgi ve düzen aracıyız, avukat değiliz.** Avukatlık Kanunu m.35'e göre hukuki mütalaa vermek, bu işlere ait evrakı düzenlemek ve işleri takip etmek baroya kayıtlı avukatlara ait. Aynı madde, herkesin kendi işini bizzat takip edebileceğini söylüyor. Ürün, **ailenin kendi işini yaparken kullandığı genel bilgi, kontrol listesi ve hatırlatma aracıdır.**
   - Dil: "değerlendirin", "genel bilgi olarak", "durumunuza göre bir avukata danışmanız önerilir". Asla "şunu yapmalısınız, kesin sonuç budur" değil.
   - Karmaşık durumlarda (borca batık tereke, anlaşmazlık, yurtdışı mülk, şirket hissesi, vasiyetname) açıkça "bu durumda bir avukata danışın" uyarısı göster.
2. **Her sayfada görünür uyarı:** "Bu içerik genel bilgilendirme amaçlıdır, hukuki danışmanlık değildir. Son tarih ve tutarları resmi kaynaktan teyit edin." Kısa ve saygılı olsun, sayfayı boğmasın.
3. **Yas içindeki kullanıcıya saygı:**
   - "Başınız sağ olsun" ifadesi girişte bir kez. Emoji yok. Ünlem yok. Satış dili yok.
   - **Zorunlu bilgi asla ücretli değildir:** Tüm son tarihler, hak edilen ödemeler ve riskler ücretsiz gösterilir. Ücretli olan sadece zaman kazandıran ve düzen sağlayan şeylerdir.
   - Ödeme teklifi ekranı kaplamaz. Kapatılabilir. Aynı oturumda en fazla bir kez kendiliğinden açılır.
4. **KVKK ve veri minimizasyonu:**
   - **Toplanmayacaklar:** TC kimlik numarası, ölüm nedeni veya herhangi bir sağlık bilgisi, tam adres, banka hesap numarası, isimler (vefat eden ve mirasçıların isimleri istenmez; dilekçe taslağında kullanıcı kendi cihazında doldurur).
   - Cevaplar sunucuya gönderilmez. Tarayıcıda tutulur ve paylaşım bağlantısı cevapları **URL'in `#` kısmında** taşır (sunucu loglarına düşmez).
   - Analitik: çerezsiz, kişisel veri içermeyen olay sayımı (Bölüm 11). Cevap içerikleri analitiğe gönderilmez, sadece "hangi bölümler gösterildi" gibi kategorik ve anonim bilgiler.
   - Aydınlatma metni ve gizlilik sayfası baştan yayında.
5. **Doğruluk:** Her içerik maddesinde kaynak ve son kontrol tarihi. Yıllık değişen tutarlar (cenaze ödeneği, vergi istisnası, dilimler) tek bir `content/parametreler.yaml` dosyasında, yıl bazlı. Her yıl Ocak ve Temmuz'da kontrol hatırlatması için README'ye not.

---

## 5. Kullanıcı akışı

### 5.1 Ana sayfa
- Başlık önerisi: "Yakınınızı kaybettiniz. Sırada ne var, birlikte bakalım."
- Alt metin: "Birkaç soruya cevap verin, size özel yapılacaklar listesini, son tarihleri ve hak edebileceğiniz ödemeleri görün. Ücretsiz. Kişisel bilgilerinizi istemiyoruz."
- Tek birincil düğme: "Listemi oluştur".
- Altında güven unsurları: "Hukuk uzmanı kontrolünde hazırlanır" (içerik avukat kontrolünden geçtikten sonra aktif edilecek, o zamana kadar gizli), "Kişisel bilgilerinizi saklamıyoruz".
- İkincil bağlantılar: "İlk 48 saat için rehber", "Yurtdışında yaşıyorum".

### 5.2 Soru akışı (tek soru tek ekran, geri dönülebilir, ilerleme çubuğu)

| # | Soru | Cevap tipi | Değişken |
|---|---|---|---|
| 1 | Vefat tarihi | Tarih seçici | `vefat_tarihi` |
| 2 | Vefat nerede gerçekleşti? | Türkiye / Yurtdışı | `vefat_yeri` |
| 3 | Siz (veya mirasçıların çoğu) nerede yaşıyor? | Türkiye / Yurtdışı / Karışık | `mirasci_yeri` |
| 4 | Vefat eden kişiye yakınlığınız | Eşi / Çocuğu / Anne-babası / Kardeşi / Diğer | `yakinlik` |
| 5 | Vefat eden kişinin durumu | Emekliydi / Çalışıyordu (sigortalı) / Kamu görevlisiydi / Esnaf-serbest çalışandı / Çalışmıyordu / Bilmiyorum | `calisma_durumu` |
| 6 | Hangi kuruma bağlıydı? (5'e göre gösterilir) | SGK (4a) / Bağ-Kur (4b) / Emekli Sandığı (4c) / Bilmiyorum | `sosyal_guvenlik` |
| 7 | Geride eşi veya bakmakla yükümlü olduğu çocuğu var mı? | Eşi var / 18 yaş altı çocuğu var / Öğrenci çocuğu var / Hiçbiri | `hak_sahipleri` (çoklu) |
| 8 | Aşağıdakilerden hangileri var? | Ev/arsa (Türkiye'de) / Başka şehirde taşınmaz / Araç / Banka hesabı / Kredi / Kredi kartı / Şirket veya ortaklık / Yurtdışında mal / Bilmiyorum | `varliklar` (çoklu) |
| 9 | Borcu olabilir mi? | Evet / Hayır / Bilmiyorum | `borc` |
| 10 | Üzerine kayıtlı abonelikler | Cep telefonu / Sabit hat-internet / Elektrik / Su / Doğalgaz / Dijital abonelikler / Bilmiyorum | `abonelikler` (çoklu) |
| 11 | Kaç mirasçı var (tahmini)? | 1 / 2-3 / 4+ / Bilmiyorum | `mirasci_sayisi` |
| 12 | Mirasçılık belgesi (veraset ilamı) alındı mı? | Evet / Hayır / Bilmiyorum | `mirascilik_belgesi` |

"Bilmiyorum" cevabı her yerde geçerli ve kötü bir cevap değildir. "Bilmiyorum" seçilen yerlerde listeye "nasıl öğrenirim" adımı eklenir.

### 5.3 Sonuç sayfası (bölüm sırası)
1. **Kritik son tarihler** (kırmızı kutu, kalan gün sayısıyla): Reddi miras, veraset beyannamesi ve varsa diğerleri. Süresi geçmişse "süre geçmiş görünüyor, bir avukata danışın" (hükmen red bilgisiyle).
2. **Size çıkabilecek ödemeler:** Cenaze ödeneği, ölüm aylığı, Emekli Sandığı ölüm yardımı, kıdem tazminatı, hayat ve ferdi kaza sigortası sorgulaması, abonelik güvence bedeli iadesi.
3. **Borç ve risk kontrolü:** Risk raporu, hayat sigortası kontrolü, reddi miras değerlendirmesi, otomatik ödeme talimatları.
4. **Adım adım liste** (zamana göre gruplu; her adım açılır kart: ne, neden, nereye, hangi belge, çevrimiçi bağlantı, tahmini süre, ipucu). Her adımda "yaptım" onay kutusu (tarayıcıda saklanır).
5. **Kurum rehberi:** Seçilen aboneliklere ve varlıklara göre ilgili kurumlar.
6. **Belge listesi:** Tüm adımlar için gereken belgelerin birleşik listesi ("Mirasçılık belgesinden 4-5 kopya alın" gibi pratik notlarla).
7. **Paylaş ve hatırla:** Aileyle paylaşım bağlantısı, takvime ekle (.ics).
8. **Ücretli paket kartı** (Bölüm 10): sakin, bilgilendirici.

---

## 6. Kural motoru

### 6.1 İlkeler
- Adımlar `content/adimlar/*.yaml` dosyalarında. Kod sadece okur, koşulları değerlendirir, tarihleri hesaplar.
- Şema `zod` ile doğrulanır. Geçersiz içerik build'i kırar.
- Koşul dili basit ve güvenli olmalı (`eval` kullanılmaz). Öneri: JSON-logic benzeri yapı ya da küçük bir kendi değerlendiricin.

### 6.2 Adım şeması (öneri)

```yaml
- id: reddi_miras
  baslik: "Mirası reddetmeyi değerlendirin"
  kategori: borc_risk          # son_tarih | odeme | borc_risk | resmi | kurum | belge
  zaman_grubu: ilk_3_ay        # ilk_hafta | ilk_ay | ilk_3_ay | ilk_4_ay | sonra
  oncelik: kritik              # kritik | yuksek | normal
  kosul:
    any:
      - { borc: "evet" }
      - { borc: "bilmiyorum" }
  son_tarih:
    baslangic: vefat_tarihi
    sure: { ay: 3 }
    not: "Süre, mirasçının ölümü öğrendiği tarihten başlar. Çoğu durumda vefat tarihidir."
  aciklama: >
    Vefat eden kişinin borçları malvarlığından fazlaysa, mirası reddetmek
    mirasçıyı bu borçlardan korur. Mirası reddetmek ölüm aylığını etkilemez.
  nereye: "Vefat edenin son yerleşim yerindeki Sulh Hukuk Mahkemesi"
  belgeler: [nufus_kaydi, olum_belgesi]
  uyari: "Borcun kapsamını bilmiyorsanız önce 'Risk raporu alın' adımına bakın. Karar vermeden önce bir avukata danışmanız önerilir."
  baglantilar: []
  kaynak: ["TMK m.605-606", "https://www.ozdipi.av.tr/reddi-miras-nedir/"]
  son_kontrol: "2026-09-28"
  dogrulandi: false
  ucretli_icerik: false
```

### 6.3 Tarih hesapları
- Ay ekleme `date-fns` ile. Ayın son günü kenar durumları için test yaz (ör. 31 Ocak + 1 ay).
- Kalan gün sayısı yerel saat diliminde (Europe/Istanbul) hesaplanır.
- Süresi geçmiş son tarihler ayrı biçimde gösterilir.
- Veraset beyannamesi süresi `vefat_yeri` ve `mirasci_yeri`'ne göre değişir (Bölüm 7, madde 12). Karmaşık kombinasyonlarda en kısa süreyi göster ve "durumunuza göre süre farklı olabilir" notu ekle.

### 6.4 Testler (en az)
- Her persona (Bölüm 2) için beklenen adım kümesi (snapshot testi).
- "Bilmiyorum" cevaplarının doğru "nasıl öğrenirim" adımlarını eklemesi.
- Son tarih hesapları ve kenar durumlar.
- Şema doğrulama: kaynağı veya son kontrol tarihi olmayan içerik testi kırmalı.

---

## 7. İçerik tohumu (ilk sürüm için)

> **Önemli:** Aşağıdaki bilgiler proje sahibinin araştırmasından derlendi ve **avukat kontrolünden geçmedi.** Hepsi `dogrulandi: false` ile başlar. Tutarlar yıla bağlıdır ve `content/parametreler.yaml`'da tutulur.

### Zaman grubu: İlk hafta
1. **Ölüm belgesi:** Hastanede vefatlarda hastane düzenler. Evde vefatlarda belediye hekimi veya en yakın sağlık kuruluşu. Tüm diğer işlemlerin temeli. Pratik ipucu: detaylı ölüm belgesi için birkaç gün sonra tekrar başvurmak gerekebilir.
2. **Cenaze ve defin** (kısa rehber sayfasına bağlantı): Belediyeler cenaze nakli ve yıkama gibi hizmetleri büyük ölçüde üstleniyor (188 hattı). Büyük şehirlerde mezar yeri için mezarlıklar müdürlüğü.
3. **E-Devlet'ten ilk bilgileri not alın:** Vefat eden kişinin e-Devlet şifresi biliniyorsa, hesap kapanmadan hangi bankalarda hesabı ve hangi abonelikleri olduğu not edilmeli. (Kaynak: kullanıcı deneyimi, Ekşi Sözlük. İpucu olarak sun, resmi prosedür gibi değil.)
3a. **Vefat edenin hesabından para çekmeyin, vefat sonrası yatan maaşı kullanmayın:** Vefattan sonra hesaba yatan emekli maaşı gibi ödemeler iade edilmesi gereken tutarlar olabilir. Vefat edenin hesabından bir mirasçının kendi başına para çekmesi diğer mirasçılar açısından hukuki sorun doğurabilir. Genel bilgi dilinde, suçlayıcı olmadan yaz. `oncelik: kritik`, `kategori: borc_risk`. (Kaynaklar: Şikayetvar SGK vefat şikâyetleri; Geçmez Hukuk yazısı.)

### Zaman grubu: İlk ay
4. **Mirasçılık belgesi (veraset ilamı):** Notere veya Sulh Hukuk Mahkemesine başvurulur. Bir mirasçının başvurusu yeterli. 4-5 kopya alınması pratikte işe yarıyor. Daha önce alınmışsa e-Devlet "Veraset İlamı Sorgulama" hizmetinden ücretsiz indirilebilir. ⚠️ e-Devlet'ten sıfırdan düzenlenip düzenlenemeyeceği konusunda kaynaklar çelişkili, avukata sorulacak.
5. **Vâris hizmetlerine bakın:** e-Devlet "Vâris Hizmetleri" bölümünden mirasçısı olunan kişi adına sorgulamalar.
6. **Banka hesaplarını bulun:** e-Devlet "Mevduat / Katılım Fonu Hesabı Bulunan Banka Sorgulama (Mirasçısı Olduğunuz Kişi Adına)". Mirasçılık belgesi gerekir.
7. **Taşınmazları bulun:** Web Tapu (webtapu.tkgm.gov.tr), "Miras Kalan Taşınmazları Ara". Mirasçılık belgesi yoksa sadece anne, baba ve eş için NVİ bilgileriyle sorgulama yapılabiliyor.
8. **Hayat ve ferdi kaza sigortası poliçelerini sorgulayın** (⭐ çok değerli, çoğu aile bilmiyor): e-Devlet "Hayat Sigortası Poliçe ve Tazminat Bilgileri Sorgulama (Mirasçısı Olduğunuz Kişi Adına)" ve "Ferdi Kaza Poliçe Sorgulama". Alternatif: SBM sitesi, "Meblağ Sigortalarında Hak Sahipliği Sorgulama (Vefat Eden Sorgu)".
9. **Kredi ve borç risk raporu alın:** Türkiye Bankalar Birliği Risk Merkezi, mirasçılık belgesiyle başvuran mirasçılara vefat edenin kredi ve kredi kartı risk raporunu veriyor.
10. **Kredide hayat sigortası kontrolü:** Kredi varsa bankaya "krediye bağlı hayat sigortası var mı?" diye sorun. Varsa kalan borç poliçe şartlarına göre sigortadan ödenebilir. Kredi kartı ve ek hesap (KMH) borçları için genelde ayrı sigorta yoksa mirasçılara kalır. Sigortacıların sık ret gerekçesi: poliçe yapılırken hastalığın bildirilmediği iddiası (bu durumda avukat önerisi).
    - **Bankanın sözüyle yetinmeyin, kendiniz de sorgulayın:** Forumlarda aynı bankada bir aileye "sigorta yok" denip borcun aileye ödetildiği, başka bir aileye ise kredinin sigortadan kapatıldığı örnekler var. Adım metninde: "Banka 'sigorta yok' dese bile 8 numaralı adımdaki e-Devlet ve SBM sorgusuyla kendiniz kontrol edin."
    - Genel bilgi: Hayat sigortası varken bankanın sigortaya başvurmadan doğrudan mirasçılardan tahsilata gitmesinin hukuka aykırı sayılabildiğine dair görüşler ve yargı kararları var. Sigorta ödemeyi reddederse avukat ve Sigorta Tahkim Komisyonu yolunu göster. Kesin hüküm gibi yazma.
11. **Otomatik ödeme talimatları:** Bankadan vefat edenin otomatik ödeme talimatlarının listesini isteyin. Faturaları başka hesaba taşıyın.
11a. **Abonelikleri zamanında üzerinize alın ya da kapatın (usulsüz kullanım riski):** Vefat eden kişinin üzerindeki elektrik, doğalgaz, su aboneliğini kullanmaya devam etmek kurumlarca "usulsüz kullanım" sayılabiliyor; forumlarda hizmetin kesildiği ve işlem yapıldığı örnekler var. Devir mi iptal mi kararı ve kurum rehberine bağlantı. `oncelik: yuksek`, `zaman_grubu: ilk_ay`. (Kaynaklar: Şikayetvar Başkent Doğalgaz ve CK Boğaziçi Elektrik vefat şikâyetleri; İnceleriz forumu.)
11b. **Abonelik güvence bedelini geri alın** (`kategori: odeme`): Kapatılan aboneliklerde yatırılmış güvence bedeli mirasçılara iade edilir. Bazı kurumlar bunun için mirasçılık belgesi ve tüm mirasçıların onayını içeren muvafakatname istiyor; belirli tutarın üstünde noter onayı istenebiliyor. Kurum rehberinde kurum bazlı not. (Kaynak: Tureng/abonelik sayfası, kurum açıklaması alıntısı; `dogrulandi: false`.)

### Zaman grubu: İlk 3 ay
12. **Reddi miras kararı** (kritik son tarih, 3 ay): Bkz. Bölüm 6.2 örneği. Borcun malvarlığını aştığı açıksa süre geçtikten sonra da "hükmen red" yolu olabileceği bilgisi, avukat önerisiyle birlikte.
    - **Karar sonrası ipucu:** "Reddi miras kararınızın birkaç onaylı kopyasını saklayın. Yıllar sonra eski borçlar için arandığınızda (banka, operatör, varlık şirketi) bu kararı sunmanız gerekebilir. İcra takibi gelirse itiraz süresini kaçırmayın." Forumlarda reddi miras yapmış kişilerin 10 yıl sonra bile eski borçlar için arandığı örnekler var. (Kaynaklar: Şikayetvar avukat/miras şikâyetleri; Palma Hukuk yazısı.)
13. **Ölüm aylığı (dul-yetim aylığı) başvurusu:** e-Devlet üzerinden veya SGK'ya başvuru. Aylık, ölümü izleyen ay başından başlar. Geç başvuruda 5 yıla kadar geriye dönük ödeme yapılır. Mirası reddetmek bu aylığı etkilemez.
    - **Beklenti yönetimi:** Forumlarda başvurunun sonuçlanması için 42 günden 6 aya kadar beklendiğini anlatan çok sayıda şikâyet var. Adımda: "Sonuçlanması uzun sürebilir. e-Devlet'ten başvuru durumunu takip edin; uzun süre değişmezse SGK'nın iletişim kanallarından (ALO 170) ve CİMER'den durum sorabilirsiniz. Bağlanan aylığın oranını kontrol edin; hata olduğunu düşünüyorsanız itiraz edin." Kesin süre verme.
14. **Cenaze ödeneği:** SGK'ya Gelir/Aylık/Ödenek Talep Belgesi ile başvurulur. 5 yıllık zamanaşımı var. 2026 tutarları `parametreler.yaml`'da (aşağıda).
15. **Emekli Sandığı ölüm yardımı** (`sosyal_guvenlik = 4c` ise): Cenaze ödeneğinden ayrı bir kalem. Dul veya yetim aylığı alırken vefat edenler için ödenmez.
16. **Kıdem tazminatı ve işçilik alacakları** (`calisma_durumu = calisiyordu` ise): Çalışırken vefat eden ve en az 1 yıl kıdemi olan kişinin kıdem tazminatı, mirasçılık belgesindeki paylara göre mirasçılara ödenir. İşverene başvurulur.

### Zaman grubu: İlk 4 ay
17. **Veraset ve intikal vergisi beyannamesi:** Mal varlığı varsa verilir. Kaynaklar:
    - Süre: Vefat Türkiye'de ve mirasçılar Türkiye'de → **4 ay**. Mirasçılar yurtdışında → **6 ay** (GİB infografiği; karmaşık kombinasyonlar için Bölüm 6.3 kuralı).
    - İnternet Vergi Dairesi (ivd.gib.gov.tr) "Veraset İşlemleri"nden elektronik verilebilir. Birden fazla mirasçı varsa biri hazırlar, diğerleri onaylar.
    - Gerekli belgeler (sahip olunan varlığa göre): Taşınmazlar için belediyeden vefat tarihine göre rayiç bedel yazısı, araç için kasko değeri (yoksa TSB kasko değer listesi), bankalardan vefat tarihi itibarıyla bakiye yazısı, tapu ve ruhsat örnekleri, borç belgeleri.
    - Pratik ipucu: Başka şehirdeki taşınmaz için o ilçe belediyesiyle telefon/e-posta ile iletişim kurulabiliyor. (Kullanıcı deneyimi.)
    - Pratik ipucu: **Rayiç bedel yazısını her taşınmaz için 2 adet alın:** biri vergi dairesine, biri tapuya hitaben. Yazı vefat tarihine göre düzenlenmeli. Emlak vergisi borcu varsa önce o ödeniyor. (Kaynaklar: Ekşi Sözlük veraset başlığı; Görkem Peker Hukuk yazısı.)
    - Uyarı: Beyannamede resmi belgelerdeki değerleri yazın. Beyan edilen değer esas alınabildiği için gereğinden yüksek yazmak fazla vergiye yol açabilir. (Kullanıcı deneyimi, `dogrulandi: false`.)
    - Genel bilgi: Taşınmaz vergi tahakkuku beklenmeden mirasçılar adına tescil edilebilir ama o taşınmaza düşen vergi tamamen ödenmeden satılamaz; tapu ilişik kesme belgesi ister (7338 s. Kanun m.19). "Satmayı planlıyorsanız önce vergi ve ilişik kesme" notu.
    - Vergi çıkarsa 3 yılda, her yıl mayıs ve kasım aylarında 6 eşit taksitte ödenir.
    - Beyanname verilmezse banka ve tapu işlemleri aksayabilir.
18. **Veraset ilişik kesme yazısı:** Beyanname sonrası vergi dairesinden. Araç devri ve bazı işlemler için gerekiyor.

### Zaman grubu: Sonra (acelesi olmayan)
19. **Tapu intikali:** Web Tapu'dan başvuru ve randevu. Tapu tescili vergi tahakkuku beklenmeden yapılabilir. Pratikte DASK poliçesi istenebiliyor (kullanıcı deneyimi).
20. **Araç devri:** Mirasçılık belgesi, veraset ilişik kesme yazısı ve ruhsatla notere.
    - **Devir sonrası kontrol:** Forumda, miras yoluyla devredilen aracın aylar sonra satışında noter sisteminde bir kayıt uyumsuzluğu hatası çıktığı ve bunun için vergi dairesine gidilmesi gerektiği, ama devri yapan noterin bunu söylemediği anlatılıyor. Adımda: "Devirden sonra aracı satmayı planlıyorsanız, satıştan önce noterde sorgu yaptırın; hata çıkarsa devir belgeleriyle vergi dairesine başvurmanız gerekebilir." (Kaynak: Ekşi Sözlük veraset başlığı, `dogrulandi: false`; avukat/mali müşavire sorulacak.)
21. **Abonelikler** (Bölüm 8 kurum rehberi): Devir ya da iptal.
22. **Dijital hesaplar:** E-posta, sosyal medya, dijital abonelikler. (Genel rehber; platformların kendi süreçlerine bağlantı.)

### Yurtdışındaki mirasçılar için ek adımlar (`mirasci_yeri` yurtdışı veya karışık)
23. **Konsolosluktan vekaletname:** Türk konsolosluğunda düzenlenen vekaletname Türkiye'de doğrudan geçerli, ayrıca apostil gerekmiyor. Yabancı noterde düzenlenirse apostil ve çoğu zaman Türkçe tercüme istenebiliyor. Tapu işlemleri için fotoğraflı ve "düzenleme şeklinde" vekaletname gerekebiliyor.
    - Vekaletnamede açıkça yazılması önerilen yetkiler: mirasçılık belgesi alma, tapu intikal ve tescil işlemleri, mirasın reddi veya kabulü, veraset ve intikal vergisi beyannamesi verme, banka işlemleri ve gerekirse dava açma.
    - Vekalet aile üyesine de avukata da verilebilir. Hangisinin uygun olduğu durumun karmaşıklığına bağlı.
    - Bankadaki parayı Türkiye'deki bir yakına aldırmak için vekaletnamenin yanında mirasçılık belgesi de isteniyor.
    - Türkiye'de banka hesabı olmayan mirasçılar için ödemenin nasıl alınacağı bankaya önceden sorulmalı; forumda hesabı olmadığı için ödeme alamayan bir mirasçı örneği var.
    (Kaynaklar: Arın Hukuk, Harbiye Hukuk, Hancızade Hukuk yurtdışı yazıları; Açıkgöz Law yorumları; Tripadvisor forumu. Hepsi `dogrulandi: false`.)
24. **Süreler:** Mirasçılar yurtdışındaysa veraset beyannamesi süresi 6 ay (kombinasyonlar için Bölüm 6.3). Reddi miras süresi yine 3 aydır; yurtdışından da vekaletle yapılabilir.

### `content/parametreler.yaml` (2026)

```yaml
yil: 2026
cenaze_odenegi:
  genel_sgk: { tutar: 6398.00, kaynak: "SGK 2026 duyurusu", gecerlilik: "2026" }
  emekli_sandigi_4c: { tutar: 26369.55, kaynak: "SGK", gecerlilik: "2026-01-01..2026-06-30", not: "Temmuz'da güncellenir, kontrol et" }
  zamanasimi_yil: 5
veraset_vergisi:
  istisna:
    her_cocuk_ve_es: 2907136
    furug_yoksa_es: 5817845
  tarife_veraset:   # GİB 2026 infografiği, avukat/mali müşavir kontrolü gerekli
    - { dilim: 3000000,  oran: 0.01 }
    - { dilim: 7000000,  oran: 0.03 }
    - { dilim: 15000000, oran: 0.05 }
    - { dilim: 30000000, oran: 0.07 }
    - { dilim: null,     oran: 0.10 }   # 55.000.000 TL'yi aşan kısım
  odeme: "3 yıl, mayıs ve kasım, 6 eşit taksit"
  not: "GVK mük. 20/D istisnasından yararlananlar için 4.6.2026'dan itibaren tek oran %1 uygulanabiliyor (7582 s. Kanun). Nadir durum, hesaplayıcıda 'özel durumlar' notu olarak göster."
sureler:
  reddi_miras_ay: 3
  veraset_beyanname_ay_tr: 4
  veraset_beyanname_ay_yurtdisi: 6
```

### Veraset vergisi hesaplayıcısı (Faz 2)
- Girdi: tahmini toplam mal varlığı (TL), eş var mı, çocuk sayısı, kendi payı (mirasçılık belgesinden ya da "bilmiyorum").
- Çıktı: "Tahmini olarak vergi çıkıyor mu / yaklaşık ne kadar" ve dilim dökümü.
- Ekranda açık uyarı: "Tahmindir. Kesin hesap için vergi dairesi veya mali müşavir."
- Yasal miras paylarını otomatik hesaplamaya **çalışma** (karmaşık ve riskli). Kullanıcıdan payı iste ya da "eşit pay varsayımı" seçeneği sun.

---

## 8. Kurum rehberi

`content/kurumlar/*.yaml`. Her kurum için:

```yaml
- id: turk_telekom
  ad: "Türk Telekom"
  tur: operator          # banka | operator | enerji | su | dogalgaz | dijital | diger
  islemler:
    - tip: iptal
      kanal: ["mağaza", "e-Devlet başvurusu"]
      belgeler: [olum_belgesi, mirascilik_belgesi, kimlik]
      notlar_resmi: []
      notlar_deneyim:
        - "Kullanıcılar müşteri hizmetlerinden iptal ettiremediklerini bildiriyor; mağaza veya yazılı başvuru daha etkili olabilir."
  kaynak: []
  son_kontrol: "2026-09-28"
  dogrulandi: false
```

- `notlar_resmi` (kurumun kendi sitesinden) ve `notlar_deneyim` (kullanıcı deneyimleri) **ayrı gösterilir.** Deneyim notları "Kullanıcı deneyimi" etiketiyle, resmi bilgi gibi değil.
- Her kurum için ayrıca `guvence_bedeli_iadesi` alanı (var mı, ne isteniyor) ve `usulsuz_kullanim_uyarisi: true/false`.

### Forumlardan gelen ilk deneyim notları (tohum, hepsi `dogrulandi: false`)
Kurum adını yazarken olgusal ve saygılı ol. "Kullanıcılar ... bildiriyor" kalıbını kullan, kurumu suçlayan dil kullanma.

| Kurum | Deneyim notu |
|---|---|
| Türk Telekom | Müşteri hizmetlerinden iptal ettiremeyenler var; mağaza veya yazılı/e-Devlet başvurusu önerilebilir. İptal edilene kadar fatura gelmeye devam edebilir. |
| Turkcell | Faturalı hattı kapatmak için tüm mirasçılar istenebiliyor; bazı kullanıcılar hattı faturasıza çevirip son faturayı ödeyerek çözdüklerini anlatıyor. Reddi miras kararını ilettikten yıllar sonra eski borç için aranan kullanıcı örneği var. |
| Vodafone | Diğer abonelikler kapanırken Vodafone iptalinin aylarca sürdüğünü anlatan kullanıcı var. Bazı kullanıcılar devirde cayma bedeli istendiğini bildiriyor. |
| Enpara | Diğer bankalardan farklı olarak kendi formatında ek bir noter belgesi istediğini bildiren kullanıcılar var. Mirasçı olarak görünmeyen yakınlara bilgi verilmeyebiliyor. |
| VakıfBank | Aynı bankada kredi hayat sigortası konusunda ailelere farklı bilgi verildiğini anlatan şikâyetler var; sigortayı e-Devlet/SBM'den kendiniz de sorgulayın. Küçük ek hesap borçlarının mirasçılara haber verilmeden avukatlık bürosuna devredildiğini anlatan kullanıcı var. |
| Başkent Doğalgaz | Aboneliği üzerine almak isteyenlere eski aboneliği iptal edip yeni abonelik açmalarının (ücretli) söylendiğini bildiren kullanıcılar var. Kullanılmaya devam eden aboneliklerde usulsüz kullanım işlemi örnekleri var. Güvence bedeli mirasçılık belgesiyle PTT'den alınabiliyor denmiş. |
| CK Boğaziçi Elektrik | Vefat edenin aboneliğini kullanmaya devam edenlere usulsüz kullanım bildirimi geldiği örnekler var. |

Proje sahibi bu notları kurumların resmi sayfalarıyla karşılaştırıp güncelleyecek.
- İlk sürüm kurumları: Turkcell, Vodafone, Türk Telekom, en büyük 6-8 banka, İstanbul/Ankara/İzmir su ve doğalgaz kurumları, büyük elektrik dağıtım/perakende şirketleri. Proje sahibi içeriği kurumların sitelerinden kontrol edecek.
- İleride: "Bu kurumla deneyiminizi paylaşın" formu (Faz 4+, moderasyonlu).

---

## 9. Dilekçe ve başvuru taslakları

- **Faz 1-3: Şablon tabanlı** (yapay zekâ yok). Şablonlar `content/sablonlar/*.md`, `{{ad_soyad}}` gibi yer tutucularla. Yer tutucular **kullanıcının cihazında** doldurulur ve PDF/metin olarak indirilir. Sunucuya bir şey gönderilmez.
- Ücretsiz şablonlar: Banka bakiye yazısı talebi, abonelik iptal dilekçesi, otomatik ödeme talimatı iptali.
- Ücretli pakette: Tüm şablonlar (vekaletname örnek metni, belediyeden rayiç bedel talebi, işverenden kıdem tazminatı talebi, sigorta şirketine tazminat başvurusu vb.).
- Reddi miras gibi mahkemeye verilen belgeler için **şablon sunulmaz**, sadece "avukata danışın" ve genel bilgi. (Hukuki risk nedeniyle.)
- Faz 5+: Yapay zekâ ile kişiselleştirme ancak avukat görüşünden sonra değerlendirilir.

---

## 10. Gelir modeli ve ücretli paket

### İlke
**Bilmesi gereken her şey ücretsiz. Zaman kazandıran ve düzen sağlayan şeyler ücretli.**

| Ücretsiz | Ücretli paket (tek seferlik) |
|---|---|
| Kişiye özel liste, tüm son tarihler | Veraset beyannamesi hazırlık dosyası (varlık bazlı belge listesi, adım adım İVD rehberi) |
| Size çıkabilecek ödemeler | Tüm dilekçe ve başvuru şablonları |
| Borç ve risk kontrolü | SMS/e-posta ile haftalık "bu hafta şunu yap" planı |
| Kurum rehberi | Aile paneli: görev atama, imza takibi, ortak belge klasörü (Faz 4, hesap gerektirir) |
| Veraset vergisi hesaplayıcı | Yurtdışındaki mirasçılar için özel rehber (vekaletname, konsolosluk, süreler) |
| Temel şablonlar, takvim dosyası | |

### Faz 1-2: Ödeme isteği testi (gerçek ödeme yok)
- Sonuç sayfasında "Takip Paketi" kartı: içerik listesi, fiyat ve "Paketi al" düğmesi.
- Tıklanınca: "Paket çok yakında açılıyor. Açıldığında ilk haber alanlardan biri olmak ve indirimden yararlanmak için e-postanızı bırakın." E-posta toplanır (açık rıza metniyle).
- **Fiyat testi:** Ziyaretçiye rastgele üç fiyattan biri gösterilir: 499 TL, 999 TL, 1.999 TL. Hangi fiyatta kaç tıklama olduğu ölçülür. Aynı ziyaretçiye hep aynı fiyat gösterilir (tarayıcıda saklanır).

### Doğru anda teklif (tetikleyiciler)
Ekran kaplamayan, sakin bir bilgi kartı olarak:
- `varliklar` içinde "başka şehirde taşınmaz" varsa → "Başka şehirdeki taşınmazlar için rayiç bedel ve vekaletname adımları pakette hazır."
- Veraset beyannamesi son tarihine ≤ 30 gün kaldıysa → "Beyanname için gereken tüm belgeler tek listede."
- `mirasci_sayisi` 4+ ise → "Kardeşlerinizle görev paylaşımı ve imza takibi."
- `mirasci_yeri` yurtdışı veya karışıksa → "Yurtdışındaki mirasçılar için özel rehber."

### Paket sayfasındaki ikna unsurları
- Kıyas: "Bir saatlik avukat danışmanlığının asgari ücreti 4.000 TL (2026 AAÜT). Bu paket, işlemleri kendiniz yaparken size yol gösterir." (Avukata karşı değil, tamamlayıcı konumlanma.)
- **Kardeşlerle bölüş:** Tek bağlantıyla ödemeyi 2-4 kişiye bölme seçeneği (Faz 3 gerçek ödemede).
- **Taziye hediyesi:** "Yas tutan bir yakınınıza hediye edin." (Faz 3.)
- 14 gün koşulsuz iade garantisi.
- Taksit seçeneği (gerçek ödemede).

### Faz 3: Gerçek ödeme
- Türkiye için ödeme altyapısı: iyzico veya PayTR (proje sahibi karar verecek, şirket/vergi kaydı gerekiyor).
- Tek seferlik ödeme. Abonelik yok.
- Satın alma sonrası: e-posta ile erişim bağlantısı (hesap zorunlu değil; sihirli bağlantı).

### Faz 5+ (ürün dışı, iş geliştirme)
Kurumsal model: Sigortacı, banka veya işverenin, vefat eden müşterisinin/çalışanının ailesine paketi kendi adıyla ücretsiz sunması. Teknik gereksinim: kurum kodu ile açılan paket, kurum logosu, kurum bazlı anonim kullanım raporu. **Şimdilik sadece mimaride bunun önünü kapatmayacak şekilde tasarla** (ör. paket erişimi bir "erişim kodu" soyutlamasından geçsin).

---

## 11. Ölçüm (analitik)

Çerezsiz ve kişisel veri içermeyen bir araç (Plausible veya kendi basit olay sayacın). Olaylar:

| Olay | Özellikler (anonim) |
|---|---|
| `akis_basladi` | kaynak sayfa |
| `soru_cevaplandi` | soru no (cevap içeriği yok) |
| `akis_tamamlandi` | toplam süre (saniye) |
| `bolum_goruntulendi` | bölüm adı |
| `adim_isaretlendi` | adım id |
| `paylasim_linki_kopyalandi` | — |
| `takvime_eklendi` | — |
| `sablon_indirildi` | şablon id |
| `hesaplayici_kullanildi` | — |
| `paket_karti_goruldu` | fiyat varyantı, tetikleyici |
| `paket_tiklandi` | fiyat varyantı, tetikleyici |
| `eposta_birakildi` | fiyat varyantı |

Basit bir yönetici sayfası (şifre korumalı) ya da analitik aracının paneli: günlük özet, dönüşüm hunisi, fiyat varyantı karşılaştırması.

### Karar ölçütleri (6-8 hafta sonunda)
- **Devam:** Akışa başlayanların ≥ %50'si tamamlıyor, paylaşım yapan var, paket kartına tıklama oranı birkaç yüzde seviyesinde, en az bir kurum görüşmesi olumlu.
- **Dur veya değiştir:** Tamamlama çok düşük, paylaşım yok, pakete kimse tıklamıyor ve kurumlar ilgisiz.

---

## 12. Teknik mimari

- **Çatı:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **İçerik:** `content/` altında YAML (adımlar, kurumlar, parametreler) ve MDX (arama motoru sayfaları). `zod` ile şema doğrulama.
- **Durum:** Cevaplar ve işaretlenen adımlar tarayıcıda (`localStorage`). Paylaşım bağlantısı cevapları sıkıştırılmış olarak URL `#` kısmında taşır. Sunucu tarafında kullanıcı verisi yok.
- **Tarih:** `date-fns` + Türkçe yerel ayar, saat dilimi Europe/Istanbul.
- **Takvim:** `.ics` dosyası üretimi (istemci tarafında).
- **PDF:** Şablonlar için istemci tarafında PDF (ör. `pdf-lib` veya yazdırma dostu sayfa).
- **Test:** Vitest (kural motoru, tarih, şema) + Playwright ile 1-2 uçtan uca akış testi (personalar).
- **Barındırma:** Vercel. Alan adı proje sahibinde.
- **Analitik:** Plausible veya eşdeğeri, çerezsiz.
- **E-posta toplama (Faz 1):** Basit bir form servisi ya da tek bir sunucu rotası + güvenli bir depolama (sadece e-posta ve fiyat varyantı; başka veri yok). Açık rıza onay kutusu.
- **Erişilebilirlik:** Mobil öncelikli, en az 16px yazı, yüksek kontrast, klavye ile gezilebilir, ekran okuyucu etiketleri.
- **Performans:** Statik üretim (SSG) mümkün olan her sayfada. Arama motoru sayfaları tamamen statik.

### Klasör önerisi
```
/app                  # sayfalar
/components
/lib/kurallar         # kural motoru, tarih hesapları
/lib/sablonlar        # şablon doldurma
/content/adimlar      # YAML
/content/kurumlar     # YAML
/content/sablonlar    # MD şablonlar
/content/sayfalar     # MDX, arama motoru sayfaları
/content/parametreler.yaml
/tests
PROJE_BRIEF.md
README.md             # kurulum + içerik güncelleme takvimi
```

---

## 13. Tasarım ve ton

- Sakin, sade, güven veren. Açık zemin, yumuşak nötr renkler, tek bir sakin vurgu rengi. Kırmızı sadece gerçek son tarih uyarılarında.
- Dil: sade Türkçe, kısa cümleler, "siz" hitabı. Hukuki terimlerin yanında gündelik karşılığı: "mirasçılık belgesi (veraset ilamı)".
- Her adım kartında aynı yapı: **Ne?** / **Neden önemli?** / **Nereye?** / **Hangi belgeler?** / **Çevrimiçi yapılabilir mi?** / **İpucu**.
- Kutlama animasyonu, konfeti, oyunlaştırma yok. Adım tamamlanınca sade bir onay işareti yeterli.
- Görsel olarak bir e-Devlet sayfasına ya da resmi kurum sitesine benzememeli (resmi kurum izlenimi vermemek için).

---

## 14. Arama motoru sayfaları (Faz 2)

Her sayfa: kısa, doğru, kaynaklı bilgi + sayfanın içinde ilgili ücretsiz araç (akışa bağlantı veya hesaplayıcı). Sayfalar:

1. Vefat sonrası yapılacak işlemler (ana rehber)
2. Reddi miras süresi ve nasıl yapılır (genel bilgi)
3. Cenaze ödeneği 2026: kimler alır, ne kadar, nasıl başvurulur
4. Ölüm aylığı (dul-yetim aylığı) başvurusu
5. Vefat edenin hayat sigortası nasıl sorgulanır
6. Vefat edenin banka hesapları nasıl öğrenilir ve kapatılır
7. Vefat edenin telefon hattı nasıl kapatılır veya devredilir
8. Veraset ve intikal vergisi hesaplama 2026
9. Mirasçılık belgesi (veraset ilamı) nasıl alınır
10. Yurtdışında yaşayan mirasçılar için rehber

Teknik: Her sayfada yapılandırılmış veri (FAQPage/HowTo şeması), son güncelleme tarihi, kaynak listesi.

---

## 14a. Marka ve alan adı kurulumu

### Marka kullanımı
- Marka: **Vefa Rehberi**. Her yerde yanında alt başlık: **"Vefat sonrası işlemler, adım adım"**. Logo altı, ana sayfa başlığı ve sosyal paylaşım görsellerinde ikisi birlikte.
- Neden bu yapı: Marka sıcak ve akılda kalıcı, alt başlık konuyu anında belli ediyor. Tanımlayıcı alan adı (`vefatislemleri.com`) resmi kurum izlenimi vermemesi için ana marka olarak kullanılmıyor, sadece yönlendirme.
- Sayfa başlığı (`<title>`) kalıbı: `{Sayfa konusu} | Vefa Rehberi`. Ana sayfa: `Vefat Sonrası Yapılacak İşlemler: Size Özel Liste ve Son Tarihler | Vefa Rehberi`.
- Meta açıklamalarda ve Open Graph etiketlerinde "vefat sonrası işlemler" ifadesi geçmeli.
- "Cenaze" kelimesi marka ve başlıklarda kullanılmaz (ürün cenaze hizmeti değil). Sadece "İlk 48 saat" rehber sayfasında içerik olarak geçebilir.
- Görsel kimlik resmi kurum sitelerine (e-Devlet, bakanlıklar) benzememeli. Bkz. Bölüm 13.

### Alan adları
| Alan adı | Kayıt yeri | Görev |
|---|---|---|
| `vefarehberi.com` | Cloudflare Registrar | **Ana site** (kanonik adres) |
| `vefarehberi.com.tr` | Turhost | `https://vefarehberi.com`'a kalıcı (301) yönlendirme |
| `vefatislemleri.com` | Cloudflare Registrar | `https://vefarehberi.com`'a kalıcı (301) yönlendirme, yol ve sorgu parametreleri korunarak |

- `www.vefarehberi.com` → `vefarehberi.com` (301). Kanonik adres `https://vefarehberi.com` (www'suz).
- Tüm sayfalarda `<link rel="canonical">` kanonik adresi göstermeli. Yönlendirilen alan adları kopya içerik üretmemeli.
- HTTPS zorunlu.

### Güvenlik ve sahiplik (proje sahibi yapar, Claude Code hatırlatır)
- Cloudflare ve Turhost hesaplarında iki adımlı doğrulama açık.
- Tüm alan adlarında otomatik yenileme açık. WHOIS gizliliği açık.
- Alan adları proje sahibinin kendi adına ve kendi hesabında.

## 15. Aşamalar ve kabul kriterleri

| Faz | Kapsam | Bitti sayılması için |
|---|---|---|
| **0. İskelet** | Next.js projesi, klasör yapısı, tasarım temeli, ana sayfa, gizlilik ve aydınlatma sayfası taslakları. `URUN_ADI` ve `URUN_ALT_BASLIK` sabitleri. | Yerelde çalışıyor, Vercel'e yayınlanıyor (geçici `*.vercel.app` adresinde) |
| **0.5 Alan adı ve yayın** | Vercel projesini `vefarehberi.com`'a bağlama (Cloudflare DNS kayıtları, Vercel'in istediği A/CNAME değerleriyle; Cloudflare proxy ayarının Vercel ile uyumlu olması). `www` → kök yönlendirme. `vefatislemleri.com` için Cloudflare Redirect Rule (301, yol korunarak). `vefarehberi.com.tr` için Turhost panelinden yönlendirme ya da DNS'i Cloudflare'a taşıyıp aynı kural. Kanonik etiketler, `robots.txt`, `sitemap.xml`. Yayına hazır olana kadar sitede "yakında" sayfası ve `noindex`. | Üç alan adı da HTTPS ile `https://vefarehberi.com`'a düşüyor; `curl -I` ile 301 ve hedef adres doğrulandı; yönlendirmelerde döngü yok; SSL geçerli |
| **1. Çekirdek** | Soru akışı, kural motoru, 10-12 adımlık içerik, sonuç sayfası (kritik son tarihler, ödemeler, borç/risk, adım listesi), tarayıcıda saklama | 3 persona testi geçiyor, tarih testleri geçiyor, mobilde akış 3 dakikadan kısa |
| **2. Değer ve ölçüm** | Tüm içerik tohumu (Bölüm 7), kurum rehberi (ilk kurumlar), ücretsiz şablonlar, .ics, paylaşım bağlantısı, veraset hesaplayıcı, analitik, "Takip Paketi" ödeme isteği testi ve fiyat varyantları, 10 arama motoru sayfası | Tüm olaylar ölçülüyor, e-posta toplanıyor, sayfalar yayında |
| **3. Gerçek ödeme** | iyzico/PayTR, ücretli paket içeriği, sihirli bağlantı ile erişim, kardeşlerle bölüşme, hediye | Test ödemesi uçtan uca çalışıyor, iade süreci tanımlı |
| **4. Aile paneli** | Hesaplar (ör. Supabase), ortak liste, görev atama, belge klasörü (şifreli), bildirimler | KVKK değerlendirmesi yapılmış, veri saklama politikası yazılmış |
| **5. Kurumsal** | Erişim kodları, kurum markalı paket, kurum raporu | İlk pilot kurumla anlaşma sonrası |

**Faz 3 ve sonrası, Faz 2 ölçüm sonuçlarına göre yeniden değerlendirilecek.**

---

## 16. Açık sorular (proje sahibi ve avukat için)

1. ~~Ürün adı ve alan adı.~~ Karar verildi: Vefa Rehberi, `vefarehberi.com` (Bölüm 14a). Marka tescili için TÜRKPATENT araştırması proje sahibinde.
2. e-Devlet üzerinden mirasçılık belgesi sıfırdan düzenlenebiliyor mu, yoksa sadece önceden alınmış olanlar mı indirilebiliyor?
3. Kişiye özel liste ve şablonlar Avukatlık Kanunu m.35 açısından hangi sınırda kalmalı? Uyarı metinleri yeterli mi?
4. Veraset beyannamesi süreleri: tüm yurtiçi/yurtdışı kombinasyonları (4, 6, 8 ay) doğru kodlandı mı?
5. Reddi miras süresinin başlangıcı: vefat tarihi mi, öğrenme tarihi mi, arayüzde nasıl anlatılmalı?
6. Ödeme altyapısı ve şirket yapısı (şahıs şirketi vb.), fatura.
7. KVKK aydınlatma metni ve açık rıza metinleri (e-posta toplama için).
8. İçeriği kontrol edecek avukatın adı/rozet kullanımı için izin.

---

## 17. Kaynaklar (araştırma sırasında kullanılanlar)

- TÜİK 2025 ölüm istatistikleri: https://www.dha.com.tr/gundem/2025te-olum-sayisi-491-bin-684-oldu-2898104
- SGK cenaze ödeneği 2026: https://www.sgk.gov.tr/Content/Post/fd3822ec-1d90-49fb-bd98-09ba1560465a/Cenaze-Odenegi-2026-01-09-02-37-56
- GİB veraset ve intikal vergisi infografiği: https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Finfografikler%2Fpdfs%2Fveraset-ve-intikal-vergisi-infografik.pdf
- GİB veraset işlemleri kullanım kılavuzu: https://ivd.gib.gov.tr/verasetKullanimKilavuzu.pdf
- 2026 veraset istisnaları (KPMG): https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yilinda-uygulanacak-veraset-ve-intikal-vergisi-maktu-istisna-tutarlari-ile-matrah-dilim-tutarlari-yayimlandi/3355
- 7582 s. Kanun ile %1 oran notu: https://www.fatiharas.com/veraset-ve-intikal-vergisi-beyannamesi/
- Veraset beyannamesi, taksitler, tapu tescili: https://www.hancizadehukuk.com/veraset-ve-intikal-vergisi-beyannamesi/
- e-Devlet Vâris Hizmetleri: https://www.turkiye.gov.tr/varis-hizmetleri
- e-Devlet mirasçı banka sorgulama: https://www.turkiye.gov.tr/bdvd-murise-ait-mevduat-katilim-fonu-hesabi-bulunan-banka-sorgulama
- e-Devlet mirasçı hayat sigortası sorgulama: https://www.turkiye.gov.tr/sbvgm-hayat-sigortasi-police-ve-tazminat-bilgileri-sorgulama-mirascisi-oldugunuz-kisi-adina
- TSB duyurusu (hayat ve ferdi kaza sorgulama, SBM): https://sigortacigazetesi.com.tr/turkiye-sigorta-birliginden-onemli-duyuru/
- Web Tapu miras kalan taşınmaz: https://www.spaceistanbul.com/tr/blog/mirascisi_oldugum_tasinmazlar:_e-devlet_uzerinden_sorgulama_ve_tapu_intikali_rehberi/165
- e-Devlet veraset ilamı sorgulama: https://www.turkiye.gov.tr/adalet-veraset-ilami-sorgulama
- Mirasçılık belgesi (e-Devlet'te sadece sorgulama görüşü): https://topaktas.av.tr/mirascilik-belgesiveraset-ilami-2025/
- Mirasçılık belgesi (e-Devlet'te düzenlenebilir görüşü): https://daykan.com/2026/02/13/e-devlet-uzerinden-mirascilik-belgesi-veraset-ilami-nasil-alinir-2026-guncel-rehber/
- Ölüm aylığı ve reddi mirasın etkisi: https://www.serafettinkaya.av.tr/olum-ayligi-dul-yetim-ayligi-sartlari/
- Cenaze ödeneği, ölüm yardımı ayrımı: https://www.erdemvarol.com.tr/yakininiz-vefat-ettiginde-hukuki-haklariniz/
- Kıdem tazminatı mirasçılara: https://yenisokegazetesi.com/haber/28110901/parayi-almayan-binlerce-kisi-var-vefat-sonrasi-devlet-tam-26369-tl-oduyor
- Reddi miras süresi ve hükmen red: https://www.ozdipi.av.tr/reddi-miras-nedir/ , https://www.ozcanlarhukuk.com/mirasin-hukmen-reddi-davasi/
- TBB Risk Merkezi mirasçı raporu, kredi hayat sigortası: https://borc.org.tr/vefat-eden-kisinin-kredi-karti-ve-ihtiyac-kredisi-borcu/
- Kredi hayat sigortası ret gerekçeleri: https://odenhukuk.com/kredi-borclusunun-olumu-sigorta-odeme-yargitay-kararlari/
- Araç devri ve belge listesi: https://www.atakumhukukburosu.com.tr/post/vefat-sonrasi-yapilmasi-gereken-i-%C5%9Flemler
- Kullanıcı deneyimleri (Ekşi Sözlük): https://eksisozluk.com/vefat-sonrasi-yapilacak-islemler--6896625?p=2
- Kullanıcı şikâyetleri (Şikayetvar, banka ve operatör): https://www.sikayetvar.com/banka-hesabi/vefat , https://www.sikayetvar.com/turk-telekom/vefat-eden-yakinimin-aboneligini-iptal-ettiremiyorum-turk-telekomdan-anlayissiz-yaklasim
- Avukatlık Kanunu m.35: https://www.lexpera.com.tr/resmi-gazete/metin/avukatlik-kanunu-13168-1136
- 2026 Avukatlık Asgari Ücret Tarifesi: https://www.edayildirimilhan.av.tr/amp/blog/post/2026-avukatlik-asgari-uecret-tarifesi-aauet
- Yurtdışı örnekler: Empathy (https://www.empathy.com/solutions/loss-support), Settld (https://www.settld.care/), Life Ledger (https://lifeledger.com/)

### Forum araştırması (ek kaynaklar)
- Şikayetvar hayat sigortası vefat: https://www.sikayetvar.com/hayat-sigortasi/vefat
- Şikayetvar SGK dul ve yetim aylığı: https://www.sikayetvar.com/sgk/dul-ve-yetim-ayligi/dilekce , https://www.sikayetvar.com/sgk/dul-ve-yetim-ayligi , https://www.sikayetvar.com/sgk/vefat , https://www.sikayetvar.com/sgk/maas/vefat
- Şikayetvar abonelikler: https://www.sikayetvar.com/dogalgaz/vefat , https://www.sikayetvar.com/baskent-dogalgaz/vefat , https://www.sikayetvar.com/ck-bogazici-elektrik/vefat
- Şikayetvar miras ve avukat: https://www.sikayetvar.com/avukat/miras , https://www.sikayetvar.com/vakifbank/sube/miras , https://www.sikayetvar.com/enpara/enparada-altin-mirasi-islemlerinde-gereksiz-noter-ucreti
- Usulsüz kullanım (tüketici forumu): https://inceleriz.com/forum/konular/olu-insan-ustune-acik-olan-elektrik-aboneligi.9662/
- Güvence bedeli iadesi: https://tureng.gen.tr/vefat-eden-ki%C5%9Finin-do%C4%9Falgaz-aboneli%C4%9Fi-nas%C4%B1l-devredilir/
- Ekşi Sözlük veraset ve intikal vergisi: https://eksisozluk.com/veraset-ve-intikal-vergisi--1039060?p=5 , https://eksisozluk.com/veraset-ve-intikal-vergisi--1039060?p=3
- Rayiç bedel yazısı 2 adet: https://www.gorkempeker.av.tr/faydali-bilgiler/gayrimenkulun-veraset-intikal-islemleri-nasil-yapilir-84.html
- 7338 s. Kanun (m.19 tescil ve devir): https://www.mevzuat.gov.tr/mevzuatmetin/1.3.7338.pdf
- Hayat sigortası varken mirasçılara başvuru: https://avukatkartal.com.tr/bilgi/olum-halinde-sigorta-odemesinin-mirascilara-yapilmamasi-halinde-dava , https://www.sigortavantaj.com/kredi-borclusu-vefat-ederse-borcu-kim-oder.html
- Reddi miras sonrası icra itirazı: https://www.palmahukuk.com/reddi-miras-yapinca-borc-kime-kalir/
- Vefat edenin hesabından para çekme: https://www.gecmezhukuk.com/vefat-edenin-banka-hesabindan-para-cekilmesi/
- Yurtdışından vekalet: https://www.arinhukuk.av.tr/yurt-disinda-yasayanlar-turkiyede-nasil-vekalet-verebilir/ , https://www.harbiyehukuk.com/yurt-disindan-vekaletname-nasil-verilir/ , https://www.hancizadehukuk.com/yurt-disinda-yasayanlarin-turkiyedeki-miras-islemleri/ , https://acikgozlawcom.wordpress.com/2020/10/21/yurt-disindan-vekalet-nasil-cikarilir-nelere-dikkat-edilmelidir/
- Yabancı mirasçı ve banka hesabı (Tripadvisor): https://www.tripadvisor.com/ShowTopic-g293969-i367-k14085671-Collecting_inheritance_in_Istanbul-Turkiye.html
