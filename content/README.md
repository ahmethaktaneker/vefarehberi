# İçerik

Adımlar, kurumlar, şablonlar ve tutarlar **kodun içine yazılmaz**, bu klasörde durur.
Bu dosyalar avukat tarafından kontrol edilecektir.

- `adimlar/` — yapılacak adımlar (YAML), Faz 1
- `kurumlar/` — kurum rehberi (YAML), Faz 2
- `sablonlar/` — dilekçe ve başvuru şablonları (Markdown), Faz 2
- `sayfalar/` — arama motoru sayfaları (MDX), Faz 2
- `parametreler.yaml` — yıla bağlı tutarlar ve süreler, Faz 1

Her içerik maddesinde `kaynak`, `son_kontrol` ve `dogrulandi` alanları zorunludur.
`dogrulandi: false` olan içerik arayüzde "kontrol ediliyor" rozetiyle gösterilir.
