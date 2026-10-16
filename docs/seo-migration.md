# FootBalance SEO aktarımı — 10 Ekim 2026

238 yayımlanmış yazı ve 475 görsel WordPress dışa aktarımından alındı. Taslak yazı yayımlanmadı. İki sitemap'teki 235 blog URL'si ve 34 sayfa URL'sinin tamamı korundu. Dışa aktarımda bulunan üç ek yayımlanmış blog da alındı. Blog içi bağlantılarda keşfedilen 13 canlı eski ürün/sayfa adresi aynı URL'de “İçerik güncellenmektedir” sayfasıyla açılır.

## Mevcut ekranların public URL'leri

| Ekran | Türkçe | İngilizce |
| --- | --- | --- |
| Ana sayfa | `/` | `/en/home/` |
| Merkezler | `/footbalance-hizmet-noktalari/` | `/en/footbalance-service-points/` |
| Randevu | `/ucretsiz-ayak-analizi/` | `/en/make-an-appointment/` |
| İletişim | `/bize-ulasin/` | `/en/contact/` |
| Hakkımızda | `/hakkimizda/` | `/en/about-us/` |
| Çözüm ortağı | `/cozum-ortagi-ol/` | `/en/become-a-partner/` |
| Blog | `/ayak-sagligi-hakkinda-bilgiler/` | `/en/foot-health-blog/` |

Yeni projedeki önceki kısa adresler public URL'lerine 301 ile yönlenir. 78 eski blog kısa bağlantısı/eski slug aynı yazıya veya randevu ekranına 301 ile yönlenir. Bilinmeyen adresler gerçek HTTP 404 döndürür. Son slash WordPress ile aynı şekilde korunur. İngilizce karşılığı bulunmayan yazılarda dil değiştirme karşı dilin blog arşivine gider.

Canlı site title ve description alanları kullanıldı; alan yoksa WordPress Rank Math alanları veya yazıdan türetilen açıklama tamamlandı. Her sayfada absolute canonical, Open Graph ve Twitter etiketleri sunucudan üretilir. Yazılar BlogPosting, site Organization ve WebSite JSON-LD kullanır. Mevcut ekranlarda TR/EN hreflang eşleri vardır; çevrilmemiş yazılara hayali çeviri alternatifi eklenmez.

## Takip ve doğrulama

GA4: `G-XBVGTE635G`. İlk açılış ve SPA sayfa geçişleri `page_view` olarak iletilir. Mevcut `footbalance:analytics` olayları GA4'e bağlandı. Ölçüm sadece production domainlerinde çalışır; localhost trafiği gönderilmez. İletilen eski `UA-65716654-14` config korundu, aktif ölçüm hedefi GA4'tür. Google ve diğer verification meta etiketleri korundu.

WordPress/Elementor/WooCommerce yönetim scriptleri ve CSS'leri taşınmadı; bu uygulamada çalışmazlar. Eski videolar yeni ana sayfada yer almadığından onların VideoObject/og:video etiketleri ve mevcut olmayan WordPress arama/oEmbed/yorum akışı etiketleri eklenmedi. RSS için çalışan `/feed/` adresi sağlandı.

## Üretilen dosyalar

`npm run seo:generate` ve her `npm run build` öncesi sitemap.xml, sitemap_index.xml, robots.txt, llm.txt, llms.txt ve feed.xml güncellenir. Sitemap'te redirect adresleri yer almaz. Randevu teşekkür/başarılı ekranları sitemap dışında ve noindex'tir. Görseller eski `/wp-content/uploads/...` adreslerinde yerel olarak sunulur; WordPress sunucusuna bağımlılık kaldırıldı.

## Doğrulama ve canlıya geçiş

- `npx tsc --noEmit`
- Değişen TypeScript dosyalarında ESLint
- `npm run build`
- `node scripts/verify-migration.mjs http://localhost:8082` bütün eski sayfaları, blogları, meta/canonical alanlarını, 301 yönlendirmelerini ve gerçek 404 davranışını doğrular.
- Ayrıntılı sayımlar: migration-inventory.json. HTTP sonuçları: migration-verification.json.
- Canlı eski sitede zaten 404 veren altı yazı içi link unresolved-legacy-links.json dosyasında listelenir. Aynı URL'de içeriği olmayan sahte yazılar üretilmedi.

Bu çalışma yerel projeye uygulandı; production yayınlama veya Search Console'a sitemap gönderme yapılmadı. Yayın sırasında public/wp-content klasörü de dağıtıma dahil edilmelidir. Search Console doğrulama etiketi korunmuştur; yayın sonrasında https://footbalance.com.tr/sitemap.xml gönderilmeli ve indeksleme takip edilmelidir.

URL korunması SEO kaybının sıfır olacağını garanti etmez. “İçerik güncellenmektedir” sayfaları önceki tam içerik yerine geçmez; önemli eski sayfaların içerikleri tamamlanmalıdır. Kaynak XML dosyaları ve eski WordPress yedeği saklanmalıdır.

## Yeniden import

```sh
python3 scripts/import-wordpress.py --export WORDPRESS.xml --pages PAGES-SITEMAP.xml --posts POSTS-SITEMAP.xml --crawl
npm run seo:generate
```

`--crawl` açık ağ erişimi kullanır. HTML önbelleği /private/tmp/footbalance-migration altındadır. İçe aktarım HTML'i izinli etiket ve attribute listesiyle temizler; scriptler ve event handler'lar içeriğe alınmaz.

## 16 Ekim 2026 A4 yönlendirme düzeltmesi

SEO yönergesindeki örnek tablonun beş kuralından yalnız `/randevu-al/` önceden tanımlıydı. Diğer dört kural eklendi. İki blog adresinin güncel hedefleri eski production sitenin HTTP 301 Location başlıkları üzerinden doğrulandı:

| Eski URL | Nihai hedef |
| --- | --- |
| `/randevu-al/` | `/ucretsiz-ayak-analizi/` |
| `/footbalance-yuzde-yuz-ile-quickfit-tabanliklari-arasindaki-fark-nedir/` | `/` |
| `/footbalance-merkez/` | `/bize-ulasin/` |
| `/ayak-sagligi-hakkinda-bilgiler/ayak-taban-agrilari/` | `/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-agrisi-neden-olur-belirtiler-ve-cozum-yollari/` |
| `/ortopedik-tabanliklar/duz-taban-tabanlik-rehberi-muhendislik-ve-biyomekanik-cozumler/` | `/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-icin-dogru/` |

Kurallar `legacy-redirect-overrides.json` ile yeniden WordPress importunda korunur. Yönlenen iki eski yazı kaynak yedeğinde tutulur; blog listesi, sitemap ve llms dosyalarına eklenmez. HTTP kontrolü, yönlendirme kaynaklarını 200 içerik kontrolünden ayırarak 301 olarak doğrular.

Doğrulama: `npm run build`, `npx tsc --noEmit`, değişen JS dosyalarında ESLint başarılı. Gerçek Node production çıktısında `node --test tests/seo-redirects.test.mjs` altı test geçti: beş kuralda GET/HEAD, slash varyantları, takip parametresi, tek adımlı 301 ve nihai canonical 200; yönlenen yazıların keşif dosyalarından çıkarılması. Tam aktarım kontrolünde 283 içerik URL'si ve yönlendirmeler için hata bulunmadı.

Bu sonuç yalnız yerel production çıktısı içindir; yeni kod canlıya yayınlanmadı. PDF'de tam listesi verilmeyen diğer 11 eski kuralın eksiksizliği bu testlerle kanıtlanmış değildir. SEO planı ve ajans Word belgesi tamamlanmış iş raporu değil, uygulama ve kabul planıdır.

## 16 Ekim 2026 trafik alan sayfaların içeriklerinin tamamlanması

`/urunler/` ve `/en/products/` eski sitedeki beş ürün grubu, 30'ar ürün, özgün açıklamalar, görseller ve detay bağlantılarıyla aktarıldı. 60 ürün detayı teknik özellikleri ve özgün görsel galerileriyle mevcut URL'lerinde sunulur. Ürünler footer'a eklendi; katalog ve ürün detaylarının TR/EN dil bağlantıları eşlendi.

Toplam 68 sayfada ürün detayı, kategori, SSS, İngilizce yorum/video ve eski home içeriği geri alındı. Trafik alan üç ürün kategori arşivi tam grup listeleriyle açılır. Görseller yerel wp-content dizinine alındı. Tekrar WordPress importunda kurtarılan sayfa kayıtları ve elle doğrulanmış yönlendirmeler korunur.

Search Console'da tıklama alan ve önceki denetimde eksik içerik/eşleme adayı olan URL'ler `traffic-content-recovery-sources.json` içinde sabitlendi. Bu gruptaki eski sitede de 404 veren 13 hatalı/eski slug, aynı konudaki mevcut gerçek içeriklere 301 ile eşlendi. Boş sayfa veya uydurma içerik üretilmedi. Önceden gözlenen başka bir eski slug'ın kaynak sitedeki yönlendirmesi de korundu. İndirme/aktarım raporu `content-recovery-audit.json` içindedir.

Kontroller: üretim build'i, TypeScript ve değişen TS/JS dosyalarında ESLint başarılı. Dokuz içerik/yönlendirme testi geçti. 60 ürünün detay, açıklama ve yerel görselleri; kurtarılan sayfaların sunucu HTML'inde 200, tek H1 ve eski canonical üretmesi; trafik alan kaynak grubunda boş içerik kalmaması doğrulandı. Tam HTTP denetimi 334 içerik URL'sinde hata bulmadı. Masaüstü ve 390 px mobil katalog görünümü, ürün detayı ve galeri görsel değiştirme tarayıcıda kontrol edildi.

Bu sonuç yerel proje ve production build'i içindir. Canlıya dağıtım yapılmadı; SEO geçiş planının ölçüm, yayın ve diğer maddelerinin tamamlandığı anlamına gelmez.

## 16 Ekim 2026 tüm sayfalarda H1 doğrulaması

Güncel production build'inin gerçek HTTP çıktısında 335 Türkçe/İngilizce içerik URL'si ve iki dilde 404 ekranı kontrol edildi. 337 çıktının tamamında tam olarak bir H1 bulundu; şablon/içerik düzeltmesi gerekmedi. `scripts/verify-migration.mjs` artık H1 sayısı bir değilse hata verir; script ve yorum içindeki HTML metinlerini saymaz. Envanter, sabit public path eşlerini de kapsar. URL bazlı sonuçlar `docs/h1-verification.json` içindedir. Bu kontrol yerel production çıktısında yapılmıştır; canlıya dağıtım doğrulaması değildir.

## 16 Ekim 2026 404 sayfası ve arama

404 ekranı ortak site düzeninde arama formu, ana sayfa/blog bağlantıları ve Search Console tıklamalarına göre seçilen popüler yazılarla yenilendi. Türkçe altı, İngilizce üç yazı gösterilir; sıralama paylaşılan raporun dönemine aittir ve canlı trafik sayacı değildir. Mevcut yazı URL'leri korunur.

Arama formu GET ile ilgili dilin blog arşivine `q` parametresi gönderir. Blog arşivi bu sorguyu sunucu HTML'inde uygular; sorgu URL'de korunur ve arama alanından değiştirilebilir. Sonuç bulunamaması için mevcut bilgilendirme kullanılır.

`tests/not-found.test.mjs` içindeki dört test gerçek GET/HEAD 404 kodunu, yönlendirme olmamasını, tek H1'i, form hedefini, popüler yazıların 200 yanıtını, sorgunun uygulanmasını ve boş sonuçları iki dilde doğrular. Production build, TypeScript ve değişen dosyalarda ESLint başarılıdır. Tam aktarım kontrolü 335 içerik URL'si ve iki 404 ekranında (337 H1 kontrolü) hatasızdır. Masaüstü/mobil görünüm ve formun tarayıcıdan gönderilmesi de kontrol edildi. Değişiklikler yereldir; canlıya dağıtım yapılmadı.
