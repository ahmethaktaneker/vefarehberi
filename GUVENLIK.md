# Güvenlik notları (29.09.2026 denetimi)

## Yapılan düzeltmeler

| # | Konu | Dosya | Test |
|---|------|-------|------|
| 1 | Umami, paylaşım linkindeki `#p=...` cevaplarını adresle birlikte gönderiyordu. `data-exclude-hash` ve `data-exclude-search` eklendi. | `lib/marka.ts` (`UMAMI_BETIK_AYARLARI`), `app/layout.tsx` | `tests/guvenlik.test.ts` |
| 2 | E-posta kaydı başkası tarafından ezilebiliyordu. Kayıt artık `SET ... NX EX`; var olan kaydın üzerine yazılmaz, yanıt aynıdır. | `app/api/paket-ilgi/route.ts` | aynı |
| 3 | API uçlarında hız sınırı yoktu. Upstash Ratelimit ile IP başına kayan pencere: e-posta 5 / 10 dk, erişim kodu 10 / 15 dk. | `lib/sunucu/guvenlik.ts` | aynı |
| 4 | Beyannamedeki T.C. kimlik numaraları kalıcı depoda süresiz duruyordu. Numaralar artık yalnızca `sessionStorage`'da; 270 gün kullanılmayan cihazda bütün veriler silinir. Şifreleme değildir. | `lib/beyanname/kimlik.ts`, `lib/depo.ts` | aynı |
| 5 | `HSET` + `EXPIRE` ayrı komutlardı; ikincisi başarısız olursa süresiz kayıt kalabilirdi. Tek atomik `SET NX EX`. | `app/api/paket-ilgi/route.ts` | aynı |
| 6 | JSON-LD'deki `replace(/</g, "\u003c")` hiçbir şey yapmıyordu: kaynakta tek ters eğik çizgiyle yazılan `\u003c` zaten `<` karakteridir. `lib/jsonld.ts` gerçek kaçış dizisini (`\\u003c`) üretir. | `components/RehberSayfasi.tsx` | aynı |
| 7 | Başka sitelerden tarayıcı isteği (CSRF), gövde boyutu (2 KB) ve içerik türü kontrolü eklendi; Redis hatası 503 döner. | `lib/sunucu/guvenlik.ts` | aynı |

## Yayında yapılması gerekenler

- Vercel ortam değişkenleri: `KV_REST_API_URL` ve `KV_REST_API_TOKEN` (ya da `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). Bunlar yoksa e-posta ucu 503 döner, erişim kodu ucunda **hız sınırı uygulanmaz**.
- Eski biçimde (hash) kayıt varsa sorun olmaz: `SET NX` var olan anahtara dokunmaz, süreleri önceden ayarlıdır.

## Kalan riskler (sertleştirme önerileri)

- **Doğrulanmamış e-posta:** Biri başkasının adresini yazabilir. Çözüm, e-posta hizmeti seçilince çift onaylı kayıt (onay bağlantısı).
- **CSP'de `script-src 'unsafe-inline'`:** Next.js'in nonce desteği sayfaları dinamik yapar; şimdilik bırakıldı.
- **Erişim kodu özetleri depoda:** Tuzsuz SHA-256, kodlar yaklaşık 59 bit. Ücretli kilit açılmadan önce sunucu tarafı gizli anahtarla HMAC'e geçilmeli.
- **Umami betiği için SRI yok:** Dış betik değişirse CSP dışında bir kontrol yok.
- **Rehber sayfaları** `marked` ile HTML'e çevriliyor ve temizlenmiyor; içerik yalnızca depodan geldiği için kabul edildi.
- Canlı adres Vercel girişiyle korunduğu için yalnızca yerel üretim derlemesinde doğrulandı.
