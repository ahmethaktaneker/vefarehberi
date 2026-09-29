# Avukata sorulacaklar (29.09.2026)

Sitedeki bütün içerik `dogrulandi: false` durumunda. Aşağıdaki sorular öncelik sırasına göre.
Cevaplar geldikçe ilgili içerik düzeltilir ve `dogrulandi: true` yapılır.

## A. En öncelikli (yayından önce)

1. **Sitenin genel konumu.** Site kişiye özel bir yapılacaklar listesi üretiyor. Bu, Avukatlık Kanunu
   m.35 anlamında hukuki danışmanlık sayılır mı? Sayfa altındaki uyarı yeterli mi?
   > "İçerikler avukat ve mali müşavir desteğiyle hazırlanır. Genel bilgilendirme amaçlıdır, kişiye özel
   > hukuki danışmanlık yerine geçmez; son tarih ve tutarları resmi kaynaktan teyit edin."
2. **"Avukat ve mali müşavir desteğiyle hazırlanır" ifadesi.** (Gelir uzmanı ifadesi kaldırıldı.) Ruhsatlı bir mali
   müşavir kontrol ederse "avukat ve mali müşavir desteğiyle" yazılabilir mi?
3. **Mirasın reddi beyanı dilekçesi** (`sablonlar/mirasin_reddi.md`). Metin doğru mu? Hangi mahkemeye
   verilir (vefat edenin son yerleşim yeri sulh hukuk mahkemesi mi, herhangi bir sulh hukuk mahkemesi
   mi)? Harç ya da ek belge gerekir mi? Böyle bir şablon sunmak risk yaratır mı?
4. **Mirası kabul sayılabilecek davranışlar (TMK m.610).** Sitede şu uyarılar var; doğru ve yeterli mi?
   - Abonelik güvence bedelini tahsil etmek mirası kabul sayılabilir.
   - Mirası reddeden kişi vefat edenin hattını devralamaz (Vodafone açıklaması).
   - Kira sözleşmesini feshetmek, evi boşaltmak mirası kabul sayılır mı?
   - Vefat edenin hesabından para çekmemek, mallarını satmamak.
5. **KVKK metinleri** (`kvkk.yaml`, `sayfalar/aydinlatma-metni.md`, `/gizlilik`).
   - E-posta, "paket açılınca haber ver" için açık rızayla toplanıyor ve yurt dışındaki sunucuda
     (Vercel / Upstash) saklanıyor. Rıza metni ve m.9 dayanağı yeterli mi?
   - 12 aylık saklama süresi uygun mu?
   - Bu e-posta ticari elektronik ileti sayılır mı? İYS kaydı gerekir mi? VERBİS kaydı gerekir mi?
   - Kullanıcının cevapları ve beyanname araçlarına yazdıkları (T.C. kimlik no dahil) yalnızca kendi
     tarayıcısında kalıyor, bize gelmiyor. Bu durumda veri sorumlusu sayılır mıyız?
   - Umami (çerezsiz ziyaret sayımı) aydınlatma metninde yeterince anlatılmış mı?
   - Erişim kodu tarayıcıda çerez olarak tutuluyor; ayrıca bilgi gerekir mi?

5a. **Beyanname doldurma aracı** (artık ücretsiz ve yayında): Kullanıcının kendi veraset beyannamesini
    GİB formuyla aynı düzende doldurup yazdırmasına yardım eden ücretsiz bir yazılım, 3568 sayılı Kanun'daki
    mali müşavirlik işi sayılır mı?

## B. Reddi miras

6. **Süre.** Sitede 3 aylık süre vefat tarihinden hesaplanıyor, "süre ölümü öğrendiğiniz tarihten başlar"
   notuyla. Bu yeterli mi?
7. **Borca batık miras (hükmen red, TMK m.605/2)** açıklaması doğru mu? Süre geçtikten sonra bu yolun
   olabileceğini söylemek doğru mu?
8. **Reddedenin payı** (TMK m.611-613): "Bir çocuk reddederse payı onun çocuklarına geçebilir; onların
   da ayrıca reddetmesi gerekebilir. Çocukların hepsi reddederse pay eşe geçer; en yakın mirasçıların
   hepsi reddederse miras tasfiye edilir." Doğru mu?
9. **Reddi miras tablosu** yalnızca bilinen varlık ve borçları toplayıp karşılaştırıyor, karar vermiyor.
   Borçlar fazlaysa dilekçeye yönlendiriyor. Bu yönlendirme sorun olur mu?

## C. Hesaplayıcılar

10. **Miras payı hesaplayıcı** (TMK m.495-500). Eş, altsoy (önceden ölen çocuğun çocukları dahil),
    anne-baba, kardeşler (tam / anne bir / baba bir), yeğenler ve büyükanne-büyükbaba zümresi (m.497:
    amca, hala, dayı, teyze; eş yoksa kuzenler; eş varsa m.497 son fıkra) hesaplanıyor. Kimse yoksa
    eşe, eş de yoksa Devlete (m.501). Üvey amca/dayı varsa hesaplanmıyor. Evlatlık ve tanınmış evlilik dışı çocuk "çocuk" sayılıyor. Kurallar doğru mu?
11. **Ölüm aylığı hesaplayıcı** (5510 m.34).
    - Anne ve babaya "toplam %25": ikisi de hak kazanırsa eşit bölündüğü varsayıldı.
    - Çocuğa %50: diğer ebeveyn de vefat etmiş, ebeveynler arasında evlilik bağı yok, hayatta kalan
      ebeveyn sonradan evlenmiş ya da başka hak sahibi yok; her biri ayrı soruluyor.
    - Anne-babanın gelir koşulu bilinmiyorsa oran gösterilmiyor. Emekli Sandığı (5434) kapsam dışı.
    - Toplam aylığı aşarsa orantılı indirim.
    Doğru mu?
12. **Veraset vergisi hesaplayıcı.** İstisna ve tarife 2026 tutarlarıyla; kullanıcının yazdığı belgeli
    borç ve cenaze giderleri toplamdan düşülüyor. Yeterli mi?

## D. Adım ve rehber içerikleri

13. **Mirasçılık belgesi:** Noterin düzenleyemediği hâller (tartışmalı mirasçılık, nüfus kaydıyla
    tespit edilemeyen soybağı, yabancı mirasçı; Noterlik K. m.71/B) doğru mu?
14. **Kıdem tazminatı:** "Hak kazanma koşulu (en az 1 yıl) varsa mirasçılara payları oranında,
    işverenden talep edilir." Doğru mu?
15. **Yurtdışından vekaletname:** Konsolosluk vekaletnamesine apostil gerekmediği, yabancı noterde
    apostil ve tercüme gerektiği, tapu için "düzenleme şeklinde" vekalet; vekaletnamede yazılması
    önerilen yetkiler listesi doğru mu?
16. **Kira (TBK m.333):** "Mirasçılar yasal bildirim süresine uyarak en yakın fesih dönemi sonu için
    feshedebilir; konutta bildirim süresi 3 ay." Doğru mu?
17. **Hesaptan para çekmeyin:** "Vefattan sonra yatan emekli maaşı iade edilmesi gereken tutar olabilir;
    bir mirasçının tek başına para çekmesi diğerleri açısından sorun doğurabilir." Yeterli mi?
18. **Kredi hayat sigortası:** "Sigorta varken bankanın mirasçılardan tahsilat yapmasının hukuka aykırı
    sayılabileceğine dair görüşler ve kararlar var; reddedilirse Sigorta Tahkim Komisyonu." Doğru mu?
19. **Dilekçe taslakları** (banka bakiye yazısı, abonelik iptali, otomatik ödeme iptali): genel örnek
    metin sınırında mı, dili uygun mu?
20. **Kullanıcı deneyimi notları.** Şikâyet sitelerinden derlenen olumsuz deneyimler kurum adıyla
    yayınlanıyor (ör. "usulsüz kullanım işlemi yapıldığı örnekler anlatılıyor"), "resmi bilgi
    değildir" etiketiyle. İtibar ya da haksız rekabet açısından risk var mı?
21. **Sözlük** (21 terim, şu an gizli), **rehber sayfaları** (12 sayfa) ve **kurum ziyaret sayfaları**
    (yayında; her kurum için "gişede şöyle diyebilirsiniz" cümleleri): genel bir okuma.

## E. Paketler ve satış (ödeme almadan önce)

22. **Beyanname aracının ileride ücretli olması** ya da ücretli bir "uzman kontrolü" hizmeti eklenmesi
    (ruhsatlı mali müşavirle) durumu değiştirir mi?
23. **Satışa geçerken:** mesafeli satış sözleşmesi, ön bilgilendirme formu, dijital içerikte cayma
    hakkı istisnası (Mesafeli Sözleşmeler Yönetmeliği m.15) ve iade politikası metinleri.
24. **İlgi testi:** Liste sonunda "Yakında: son tarih hatırlatmaları ve uzman kontrolü, haber almak
    ister misiniz?" ile açık rızayla e-posta toplanıyor. Tüketici ve KVKK mevzuatına uygun mu?
25. **Kullanıcı yorumları:** Üç kişinin onayı sözlü alındı, baş harf ve ille yayınlanıyor. Yazılı onay
    gerekir mi?

## F. Kişisel (proje sahibi için)

26. Şahıs şirketi açmak ileride avukatlık stajıyla (Avukatlık K. m.11) ya da burslarla çelişir mi?
    Staj döneminde şirket nasıl yönetilmeli?

---

## Vergi uzmanına / mali müşavire sorulacaklar

- İnternet Vergi Dairesi'nden veraset beyannamesi fiilen verilebiliyor mu?
- Beyannamede araç değeri: kasko değer listesi mi kullanılıyor?
- Hangi sigorta ödemeleri beyan edilir?
- Borç ve masraflar toplamdan düşülüp kalanın paylara bölünmesi doğru bir sadeleştirme mi?
- Bizim ürettiğimiz, GİB formuyla aynı düzende doldurulmuş çıktıyı vergi dairesi kabul ediyor mu?
- Emekli Sandığı ölüm yardımı Temmuz-Aralık 2026: 29.934,73 TL alt sınır doğru mu?
