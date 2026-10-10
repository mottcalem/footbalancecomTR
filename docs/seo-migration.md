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
