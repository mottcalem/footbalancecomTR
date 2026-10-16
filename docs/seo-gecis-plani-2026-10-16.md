# FootBalance SEO geçiş denetimi ve uygulama planı

Tarih: 16 Ekim 2026. Karar: yayın öncesi kritik eksikler kapanmadan geçişe hazır kabul edilmemeli.

## 1. Kapsam ve kanıt sınırı

Bu rapor 12 Ekim 2026 tarihli 8 sayfalık SEO yönergesinin tamamı, mevcut proje kaynak kodu, aktarım kayıtları ve kullanıcı tarafından sağlanan Search Console Excel dosyası üzerinden hazırlandı. İstek denetim ve planlamadır; bu çalışmada uygulama kodu, DNS, yönlendirmeler veya ölçüm hesapları değiştirilmedi. Önceki blog/sidebar değişiklikleri çalışma ağacında korunuyor.

PDF, WordPress/Elementor üzerinde tema değişikliği varsayıyor. Mevcut proje React/TanStack Start ve Node SSR kullanıyor. Bu nedenle geçiş, tasarımla beraber platform değişikliği de içeriyor. Rank Math, WPML, Quform ve LiteSpeed ekranlarındaki işlemler yeni platformda uygulanamaz; bunların URL, içerik, dil eşleri, şema, önbellek ve ölçüm çıktıları yeni platformda korunmalıdır. Belgede geçen işlemler bu raporda doğrulanacak gereksinimler olarak ele alındı; kendiliğinden yayınlama veya hesap değişikliği yetkisi sayılmadı.

Domaini footbalance.com.tr kabul ettim. Mesajdaki footbalance.com.te ifadesi, PDF ve rapordaki .com.tr ile uyuşmuyor ve yazım hatası olarak değerlendirildi.

Kanıt türleri:

- Kod/veriyle doğrulananlar: 228 TR + 10 EN yazı, 47 sayfa kaydı, 84 yönlendirme kaydı; 42 yazıda tablo; 2 yazıda iframe; blog gövdelerinde sıfır script; 48 yazıda değiştirilme tarihi yayın tarihinden eski.
- Önceki rapor: docs/migration-verification.json, 285 URL için hata olmadığını kaydediyor. Bu geçmiş bir testtir; bu turda yeniden tam HTTP taraması yapılmadı. Test içerik eşitliğini, ürün/arşiv kapsamını, çift canonical/meta etiketlerini, performansı veya ölçüm isteklerini doğrulamıyor.
- Canlı web incelemesinde ana sayfanın eski içerik sürümüne erişildi. Canlı robots ve sitemap dosyaları web aracıyla okunamadı; yerel ağda domain DNS çözümlemesi yapılamadı. Bunların production durumu doğrulanmış sayılmıyor.
- Search Console Excel: tek sekme “Sayfa sayısı”, 605 URL satırı, satır toplamı 6.626 tıklama ve 509.282 gösterim. Dosyada tarih aralığı, günlük seri, sorgular, cihaz/ülke ve arama türü filtresi yok. Sayılar aylık/90 günlük veya tüm mülk toplamı diye sunulamaz. Tarih aralığı ayrıca teyit edilmeli.
- Pozisyon sütununda 74 hücre Excel tarihi olarak kaydedilmiş. Bunlar tahminle ondalık sıralamaya çevrilmedi; öncelikler tıklama ve gösterim üzerinden belirlendi. Orijinal rapor değiştirilmedi.

## 2. Trafiğe göre öncelik

İlk 10 URL 3.316 tıklama (50,0%), ilk 50 URL 5.709 tıklama (86,2%) taşıyor. İlk 50'nin tamamı birebir karşılaştırılmalı; diğer sayfalar da otomatik envanter testinden geçmeli.

En acil içerik açığı /urunler/: 410 tıklama, 12.555 gösterim; rapordaki ikinci en çok tıklanan URL. Şu anda kaydı var fakat eski ürün listesi ve anlamlı içerik yerine genel “İçerik güncellenmektedir” şablonuna düşüyor. Adresin 200 dönmesi yeterli koruma sağlamaz.

/uncategorized-tr/ altındaki URL'ler bu dosyada 927 tıklama (14,0%) taşıyor. Sidebar'da varsayılan kategori etiketinin gizlenmesi yazı URL'lerini değiştirmedi. Bu URL'ler ve kategori slug'ları korunmalı.

Kaynak koda göre eşleme özeti:

| Durum | URL adedi | Tıklama | Yorum |
| --- | ---: | ---: | --- |
| Blog içeriği var | 225 | 5.042 | İçeriğin kayıpsızlığı ayrıca karşılaştırılmalı |
| Özel şablon var | 15 | 965 | Başlık, ana metin ve iç bağlantılar karşılaştırılmalı |
| İçe aktarılmış sayfa içeriği var | 3 | 31 | Render ve dil eşleri kontrol edilmeli |
| Canonical alias /en/ | 1 | 44 | Kodda /en/home/ hedefine 301 yolu var; canlıda doğrulanmalı |
| Yönlendirme kaydı var | 1 | 0 | Son hedef ve zincir doğrulanmalı |
| Geçici/eksik içerikli sayfa | 26 | 452 | Kalıcı içerik veya eşdeğer hedef kararı gerekiyor |
| Eşleme/route bulunamadı | 334 | 92 | Eski slug, eksik ürün, arşiv ve eski hatalı URL ayrımı gerekiyor |
| Toplam | 605 | 6.626 | Her URL tek sınıfta |

Son iki grup 544 tıklama (8,2%) taşıyor. Bu beklenen kayıp tahmini değildir; doğrudan içerik/URL çözümü gerektiren kaynak koda dayalı inceleme grubudur. “Route bulunamadı” canlıda ölçülmüş 404 anlamına gelmez; tarihsel rapordaki her URL'yi yeniden yayınlamak da doğru değildir. Önce eski sitedeki son durum ve eşdeğer içerik kontrol edilmeli.

## 3. PDF maddeleri ile mevcut durum

| Madde | Durum | Bulgular ve yapılacak iş |
| --- | --- | --- |
| A1 Kalıcı bağlantılar | Kısmen hazır | Blogların eski path değerleri korunuyor; trailing slash ve public path kuralları var. Tam eski envanterle URL bazlı karşılaştırma gerekli. |
| A2 Kategoriler | Kısmen hazır | Yazı path'leri kategori isminden yeniden üretilmiyor. /uncategorized-tr/ adresleri korunuyor. Eski kategori arşivleri sidebar filtreleriyle karşılanmış değil. |
| A3 Sabit sayfalar | Kritik açık | /urunler/, /ortopedik-tabanlik-hakkinda/ ve bazı EN sayfalar genel eksik içerik şablonunda. /home/ ve /en/home-v2/ gibi eski kopya adresler için mevcut davranış ve canonical kararı gerekiyor. |
| A4 Eski 16 kural | Kritik açık | 84 kural bulunması eski 16 kuralın korunduğunu kanıtlamıyor. PDF'deki /footbalance-merkez/ ve /footbalance-yuzde-yuz-ile-quickfit-tabanliklari-arasindaki-fark-nedir/ kuralları mevcut haritada yok. Tam 16 kuralın kaynağı gerekli. |
| A5 SEO alanları | Kısmen hazır | Title, description, canonical, OG/Twitter üretimi var. Aktarım bazı alanlarda fallback kullanıyor; eski özel canonical/noindex ve şema ayarlarının tamamı birebir aktarılmış değil. |
| A6 H1/başlık düzeni | Kısmen hazır | Sayfa şablonlarında H1 var; blog gövdelerinde H1 yok. Tüm render çıktısı sayılmalı. PDF footer/sidebar'da H1–H4 istemiyor; mevcut footer ve yeni sidebar H2 kullanıyor. Bu teknik bir sıralama felaketi değil, yönergeye uyum için düzeltilmeli. |
| A7 Yazı gövdesi | Kritik karşılaştırma eksik | 238 yazı ve 42 tablolı yazı mevcut. PDF 7 videolu yazı diyor; mevcut gövdelerde 2 iframe, 0 video var. Importer tüm scriptleri siliyor; PDF'deki 53 gömülü soru-cevap şemasının korunduğu kanıtlanmıyor. Metin, tablo, video, kutu ve link fark raporu gerekiyor. |
| A8 EN ve dil bağlantıları | Kritik kapsam açığı | 10 EN blog mevcut; ürünler ve bazı sayfalar eksik. Özel sayfalarda hreflang var, legacy sayfalarda yok. Dil seçici birçok legacy içerikte karşılık yerine bloga gidiyor; gerçek çeviri çiftleri eşlenmeli. |
| A9 Menü/iç linkler | Kritik açık | /urunler/ menü/footer'da yok; FAQ bağlantıları eski sayfa yerine ana sayfa anchor'ına gidiyor. Blog sayfalaması yalnız React state + button; sayfa 2+ için ayrı URL ve taranabilir link yok. Kritik 50 için en fazla 3 tık şartı taramayla ölçülmeli. |
| A10 Görseller | Temel hazır | Önceki kayıt 475 medya, blog kapaklarının yerel dosya kontrolünde eksik yok. Eski tüm src/srcset, alt ve indirilebilir dosyaların tam korunması ayrıca doğrulanmalı. Kapak görsellerinde genişlik/yükseklik ve mobil boyutlar kontrol edilmeli. |
| A11 Hız | Ölçülmedi | Yeni/eskide karşılaştırmalı PageSpeed veya alan verisi yok. Önceki build çıktısında bazı ana sayfa görselleri 0,9–1,3 MB. Kaynak dosya boyutu doğrudan LCP sonucu sayılmaz, optimizasyon adayıdır. |
| A12 Ölçüm/formlar | Kritik ölçüm açığı | GA4 G-XBVGTE635G doğrudan gtag ile kurulmuş; UA config hâlâ var. Kodda GTM-T4T2LQLH, Ads AW-11017995431, Meta Pixel/CAPI, Clarity ve Consent Mode entegrasyonu bulunamadı. Form onay kutusu çerez izin yönetiminin yerini tutmuyor. |
| A13 Arşiv/teknik dosyalar | Kritik kapsam açığı | 60 ürün, 6 blog kategorisi, 10 ürün kategorisi ve 41 etiket için tam kapsam yok. Veri setinde yalnız 12 TR ürün path'i var ve içerikleri boş. /author/ davranışı yok. Robots/sitemap/llms dosyaları var; eski kurallarla karşılaştırma gerekli. 404 ekranında arama/popüler yazılar yok. |
| B1 İndeksleme erişimi | Canlı doğrulanmalı | Yerel robots genel taramaya izin veriyor, SEO helper index üretiyor. Hosting X-Robots-Tag, test alanı, parola ve WAF canlıda kontrol edilmeli. Teşekkür sayfalarının noindex olması korunmalı. |
| B2 Önbellek/yayın | Yeni platforma uyarlanmalı | Elementor/LiteSpeed yerine build, Node SSR servis sağlığı, statik medya dağıtımı ve CDN cache temizliği test edilmeli. Eski WordPress geri dönüş için hazır tutulmalı. |

PDF'deki sayısal beklentiler başlangıç envanteridir; güncel WordPress exportu ve canlı tarama ile son durum sabitlenmelidir. Belgedeki 62 EN sayfa toplamı da ürün/çeviri listesiyle URL bazında uzlaştırılmalı, yalnız sayı üzerinden onay verilmemelidir.

## 4. Uygulama sırası

### Aşama 1: Eski sitenin referansını dondur - yaklaşık 0,5–1 iş günü

Sorumlu: geliştirme + SEO sorumlusu. Bağımlılık: WordPress export/yedek, eski yönlendirme tablosu, Search Console dönem bilgisi.

1. Veritabanı, wp-content, SEO alanları, ürünler, taxonomy'ler, dil eşleri ve 16 kuralın tam yedeğini al.
2. Sitemap + CMS export + Search Console'daki 605 URL + backlink/erişim loglarını tek envanterde birleştir. Taslak, eski hatalı slug, pagination, attachment ve parametre URL'lerini işaretle.
3. Her URL için tür, dil, eski HTTP/son hedef, index/noindex, title, description, canonical, hreflang, H1, ana metin kelime sayısı, tablo/video/schema/link/görsel sayısı kaydet.
4. Karar alanını doldur: aynı URL + aynı niyetle 200; gerçekten taşınmışsa eşdeğere tek adımlı 301; gerçekten silinmiş ve eşdeğersizse gerekçeli 404/410. Her şeyi ana sayfaya yönlendirme.
5. İlk 50'yi verilen dosyanın tıklamalarından sabitle; PDF'deki 90 günlük tıklamalar ile yeni raporu tarihleri belli olmadan birleştirme.

Çıkış ölçütü: bütün kaynak URL'ler açıklamalı bir karara sahip; eski 16 kuralın hiçbiri belirsiz değil. Orijinal WordPress yedeği ve yeni release geri dönüş adımları kayıtlı.

### Aşama 2: Trafik taşıyan eksik sayfalar ve arşivler - yaklaşık 2–4 iş günü

Sorumlu: geliştirme + içerik/ürün sorumlusu. Bağımlılık: Aşama 1.

1. İlk olarak /urunler/ ve /en/products/ sayfalarını mevcut URL'de, eski ürün grupları ve anlamlı metinle yeniden kur. Eski ürün detaylarına ve güncel shop hedeflerine taranabilir link ver.
2. 30 TR + 30 EN ürünün tam listesini aktar. Satış yeni shop'taysa ana sitedeki bilgilendirici sayfayı koruma veya birebir ürün hedefine 301 seçeneklerini ürün bazında değerlendir. Toplu shop ana sayfa yönlendirmesi uygulama.
3. /ortopedik-tabanlik-hakkinda/, EN FAQ, EN yorum/video ve diğer eksik sabit sayfaları eski içeriğiyle tamamla.
4. /category/, /product-category/, /tag/ URL'lerini mevcut slug'larda ve üyelikleriyle destekle. Eski indeks durumu korunmalı; sıfır tıklama gerekçesiyle toplu silme/noindex yapma.
5. Eksik 16 kuralı ve GSC'deki eski slug'ları eşdeğer hedefleriyle tamamla. /author/ ana sayfa yönlendirmesini eski durumla doğrula.

Çıkış ölçütü: geçerli, trafik taşıyan hiçbir URL boş “İçerik güncellenmektedir” sayfasında kalmıyor; ürün ve arşiv kapsamı envanterle eşleşiyor; tüm eski kurallar doğru son hedefte bitiyor.

### Aşama 3: Blog, dil ve metaveri eşitliği - yaklaşık 1–2 iş günü

Sorumlu: geliştirme + SEO sorumlusu.

1. Blog sayfa numarasını URL'ye taşı; eski /page/N/ adresleri varsa koru veya birebir 301 planla. Sayfalama gerçek href linkleriyle çalışsın; doğrudan sayfa 2 isteği ve JS kapalı erişim test edilsin. Her sayfanın uygun canonical'ı olsun.
2. Sidebar kategori filtreleri için karar ver: eski kategori URL'si birincil listeleme adresi olsun; ?category= URL'si onunla rekabet eden kopya üretmesin. Arama sorgusu/filtre/sayfalama canonical ve robots davranışları ayrı belirlensin.
3. İlk 50 URL'de eski ve yeni ana içerikleri elle karşılaştır; 238 blogun tamamında otomatik kelime/tablo/link/video karşılaştırması çalıştır. %10'dan fazla metin düşüşünü incele; kısa ama kritik tablo/video kayıplarını oran küçük olsa da düzelt.
4. Scriptleri topluca açma. Güvenilir JSON-LD'yi parse ederek ayrı veri alanına aktar ve güvenli serializer ile üret. Görünen soru-cevap metni korunmalı. Diğer şema türlerini eski yapı ve sayfa içeriğine göre değerlendir.
5. Title/description/canonical/robots alanlarını eski kayıtla karşılaştır; intentional farkları belgeleyerek onayla. Varsayılan canonical üretimi eski özel canonical kararını ezmesin.
6. Gerçek TR/EN çeviri çiftlerini URL/kimlik tablosuyla eşle. Dil seçici ve karşılıklı hreflang aynı içeriğe gitsin; olmayan çeviriye hayali eş ekleme. html lang=en geçerlidir, en-US değerini sırf birebir olsun diye zorunlu kabul etme.
7. Global başlık düzenini sadeleştir; sayfa H1'i konuya ait olsun. Sidebar/footer başlıklarını PDF'ye uyum için stil verilmiş metin yap. Semantik H2 kullanımının tek başına SEO hatası olmadığını dikkate al.
8. 48 yazıdaki published/modified tutarsızlığını asıl kaynakla düzelt; tüm yazılara yapay şekilde bugünün tarihini atama. Sitemap lastmod gerçek içerik değişikliğini yansıtsın.

Çıkış ölçütü: açıklamasız içerik/metadata kaybı yok; tüm dil eşleri erişilebilir; tablo ve videolar mobilde çalışıyor; başlık/canonical/robots/JSON-LD tekil ve tutarlı.

### Aşama 4: Ölçüm, formlar ve hız - yaklaşık 1–2 iş günü

Sorumlu: geliştirme + ölçüm/reklam sorumlusu.

1. GA4 mülk kimliğinin doğru hesaba ait olduğunu doğrula. PDF önerisine uygun olarak tek GTM üzerinden kurulum veya tek doğrudan gtag seç; iki sistemden çift page_view gönderme. UA config'i kaldır.
2. GTM, Ads, Meta Pixel/CAPI, Clarity ve click-id yakalamayı mevcut hesap/etiket envanterine göre eşle. Kodun varlığı yeterli değildir; tarayıcı ağ isteği, DebugView/Tag Assistant ve ilgili test araçlarında doğrula.
3. Randevu, çözüm ortaklığı ve video erişimi için başarılı sunucu teslimi sonrası birer dönüşüm üret; form açılışını başarı sayma. Eski teşekkür URL'sine bağlı ölçümü koru veya eşdeğer olaya taşı. Pixel+CAPI için event_id ile çift sayımı önle.
4. Çerez tercihleri ve Consent Mode akışını kur; reddet/kabul/tercih değişikliği senaryolarını doğrula. Formdaki iletişim rızasını ölçüm rızasıyla birleştirme. Hukuki metin kararını ilgili sorumlu değerlendirsin.
5. İlk form gönderimi, hata/tekrar deneme, mobil, TR/EN ve gerçek teslim/CRM/e-posta senaryolarını test ortamında uçtan uca doğrula. Bu denetim turunda gerçek müşteri başvurusu gönderilmedi.
6. Ana sayfa, yüksek trafikli blog, ürün ve merkez sayfasında mobil performansı karşılaştır. Görselleri responsive modern formatlarla sunarken eski medya URL'lerini çalışır tut; width/height, font yükleme, SSR süresi ve JS maliyetini ölç.
7. Hedefler LCP ≤2,5 sn, CLS ≤0,1, INP ≤200 ms. Lighthouse laboratuvar kontrolü ve gerçek kullanıcı alan verisini ayır; INP saha doğrulaması yayın sonrasında veri birikimi gerektirir.

Çıkış ölçütü: tekil ölçüm, doğru izin akışı, başarılı teslim sonrası doğru dönüşüm ve kanıtlı performans raporu. Bu bölümün eksikleri SEO sıralama hatası ile ölçüm kaybı olarak ayrı izlenmeli.

### Aşama 5: Yayın provası ve yayın kararı - yaklaşık 0,5–1 iş günü

1. Production build üzerinde tüm envanteri tara. 200/301/404/410, zincir/döngü, yönlendirme hedefi, tek canonical, robots, hreflang, schema, içerik, medya ve kırık iç linkleri raporla.
2. Ürün/arşiv kapsamını mevcut verify-migration testine dahil et. Test yalnız title varlığını değil eski değerle eşitliği ve ana içerik korunmasını kontrol etsin. Hata raporunda test zamanı, commit/release, ortam ve kapsanan URL listesi bulunsun.
3. Kritik 50'nin ana sayfadan taranabilir linklerle en çok 3 tıkta erişildiğini doğrula. Sitemap erişilebilirliği, menü/iç link erişilebilirliğinin yerine geçmez.
4. HTTP/HTTPS, www/non-www, slash ve UTF-8/encoded slug varyantlarının nihai HTTPS canonical'a yönlendiğini hosting üzerinde test et. Query tracking parametrelerini gerektiğinde koru; canonical gereksiz tracking parametresi taşımasın.
5. Staging parola veya noindex ile korunmalı; production'da yanlışlıkla site geneli engel olmamalı. Robots disallow, noindex'in yerine geçmez. Teşekkür gibi bilerek noindex sayfalar ayrıca korunur.
6. Sitemap'e yalnız nihai, indexlenebilir 200 URL'leri koy; placeholder, redirect, yanlış dil veya hatalı lastmod kayıtlarını çıkar/düzelt. /sitemap_index.xml ve eski bot kurallarının erişimini doğrula.
7. WordPress yedeğini, yeni release'i, DNS/CDN değişikliklerini ve geri dönüş komut/adımlarını prova et. Git geçmişini yeniden yazmadan sürümle.

Yayın kapısı: trafik taşıyan URL'lerde açıklamasız kayıp yok; kritik sayfada placeholder yok; 16 kuralın tamamı doğrulanmış; tüm ürün/arşivler karara bağlanmış; tüm kritik HTTP/metadata/medya testleri geçiyor; ölçüm ve form teslimi kanıtlı; staging/production indeks ayrımı ve rollback hazır.

Tahmini toplam teknik çalışma: kaynaklar ve hesap erişimleri hazırsa yaklaşık 6–11 iş günü. Bu bir taahhüt değil; eksik ürün/arşiv kaynakları ve içerik farkları süreyi belirler. GA4 karşılaştırma verisi için önerilen 14 günlük veri toplama süresi bu teknik işçilikten ayrıdır.

## 5. Yayın günü ve yayın sonrası

| Zaman | Kontrol | Sorumlu/karar |
| --- | --- | --- |
| T-14 gün veya mümkün olan en erken tarih | Eski sitede düzgün GA4 ve izin ölçümü; Search Console dönem/filtresini sabitle | Ölçüm + SEO. Eski GA4 yoksa GSC ve sunucu logları başlangıç referansı olur. |
| T-7 / T-1 gün | İçerik/URL dondurma, son export farkları, tam prova; hosting değişiyorsa DNS TTL planı | Geliştirme + hosting |
| Yayın anı | DNS/servis/CDN geçişi, tüm wp-content dağıtımı, cache temizliği, TLS/host kuralları | Hosting + geliştirme |
| İlk 15–60 dakika | Ana sayfa, /urunler/, merkezler, randevu, kritik bloglar, EN, 16 redirect, robots/sitemap, form ve ölçüm kontrolü | Kritik hata varsa anında düzelt veya test edilmiş release'e dön |
| İlk 24–72 saat | 404/5xx logları, crawler erişimi, medya, bot engeli, GA4 ve dönüşüm akışı | Geliştirme + SEO + ölçüm |
| 7 / 14 / 28. gün | GSC sayfa+sorgu+cihaz kırılımında tıklama/gösterim/CTR/pozisyon; sayfa indeksleri, canonical seçimi | Aynı filtre ve karşılaştırılabilir günlerle değerlendir |
| 6–8. hafta | Kalıcı sapmaları ve içerik/bağlantı iyileştirmelerini değerlendir | SEO + içerik |

Search Console mülkü ve doğrulaması korunmalı; mevcut sitemap adresi güncellenerek kontrol/gönderim yapılmalı. Domain aynı kaldığı için sırf platform değişti diye Change of Address işlemi yapılmamalı. Eski hosting ve yedek, DNS geçişi ve bot erişimi sorunsuz kanıtlanmadan kaldırılmamalı.

Önerilen erken uyarılar, otomatik sıralama kaybı kanıtı olarak kullanılmaz:

- Kritik URL'de 404/5xx, yanlış noindex veya yanlış canonical: beklemeden teknik müdahale.
- 7 günlük karşılaştırılabilir organik tıklamalarda %15–20 düşüş: sorgu/sayfa/cihaz bazında araştırma başlat; bu eşik proje için öneridir, Google standardı değildir.
- Tek başına bir günlük GSC dalgalanması: veri gecikmesi ve hafta etkisi nedeniyle rollback tetikleme.
- Form sunucu tesliminde hata: SEO grafiğinden bağımsız olarak acil operasyonel müdahale.

## 6. Checklist'te güncellenmesi gereken varsayımlar

1. “URL değişirse tüm sıralamalar sıfırlanır” ifadesi fazla kesindir. Doğru eşdeğer hedefe kalıcı yönlendirme desteklenen yöntemdir. Bu projede gereksiz URL değişikliğinden kaçınmak riski ve işi azaltır.
2. PDF FAQ şemasını Google'da soru-cevap zengin sonucu kaynağı olarak anlatıyor. Google'ın güncel değişiklik kaydı, FAQ rich results özelliğinin 7 Mayıs 2026'dan itibaren gösterilmediğini belirtiyor. Görünen soru-cevap içeriği ve veri bütünlüğü korunmalı; FAQ şemasını geri getirmek tek başına güncel Google zengin sonuç/sıralama kazanımı vaadi değildir. Video ve ana içerik kaybı daha önceliklidir.
3. llms.txt korunabilir; Google'ın güncel açıklamasına göre Google Search görünürlüğünü olumlu veya olumsuz etkilemez. SEO geçişinin yayın kapısı URL/içerik/indeksleme performansıdır.
4. Footer/sidebar'da H2 bulunması Google açısından otomatik ceza sebebi değildir. PDF'ye biçimsel uyum ile gerçek teknik riskler ayrı önceliklendirilmelidir.
5. İndekslenmemesi gereken teşekkür sayfalarında noindex kasıtlıdır. “Hiçbir sayfada noindex olmasın” kuralı site geneli uygulanmamalı.
6. Rank Math odak anahtar kelimesi editoryal yardımcı veridir; yeni platformda arama motoruna çıkan title/description/canonical/robots/schema ve görünen içerik önceliklidir.

## 7. Kritik 50 URL

Tıklama sıralaması verilen Excel'in kendi dönemi içindir. “İçerik mevcut” ifadesi SEO eşitliği onayı değildir.

| Sıra | URL | Tıklama | Gösterim | Kaynak koda göre durum |
| --- | --- | ---: | ---: | --- |
| 1 | [/](https://footbalance.com.tr/) | 654 | 15587 | Özel sayfa şablonu mevcut |
| 2 | [/urunler/](https://footbalance.com.tr/urunler/) | 410 | 12555 | İçeriği eksik geçici sayfa |
| 3 | [/ortopedik-tabanliklar/topuk-dikeni-tabanlik-agridan-kurtulusun-anahtari/](https://footbalance.com.tr/ortopedik-tabanliklar/topuk-dikeni-tabanlik-agridan-kurtulusun-anahtari/) | 349 | 11264 | Blog içeriği mevcut |
| 4 | [/ayak-sagligi-hakkinda-bilgiler/ayakkabi-tabani-rehberi-hangi-taban-sizin-icin-daha-saglikli/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayakkabi-tabani-rehberi-hangi-taban-sizin-icin-daha-saglikli/) | 338 | 28376 | Blog içeriği mevcut |
| 5 | [/ayak-sagligi-hakkinda-bilgiler/kompresyon-corabi-nedir-ne-ise-yarar-ve-nasil-secilir/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/kompresyon-corabi-nedir-ne-ise-yarar-ve-nasil-secilir/) | 335 | 16927 | Blog içeriği mevcut |
| 6 | [/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-icin-dogru/](https://footbalance.com.tr/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-icin-dogru/) | 319 | 12754 | Blog içeriği mevcut |
| 7 | [/footbalance-hizmet-noktalari/](https://footbalance.com.tr/footbalance-hizmet-noktalari/) | 278 | 6352 | Özel sayfa şablonu mevcut |
| 8 | [/uncategorized-tr/sabah-kalkinca-ayak-tabaninda-i-lk-adim-agrisi-neden-olur/](https://footbalance.com.tr/uncategorized-tr/sabah-kalkinca-ayak-tabaninda-i-lk-adim-agrisi-neden-olur/) | 219 | 13550 | Blog içeriği mevcut |
| 9 | [/ortopedik-tabanliklar/ortopedik-tabanlik-rehberi/](https://footbalance.com.tr/ortopedik-tabanliklar/ortopedik-tabanlik-rehberi/) | 216 | 6794 | Blog içeriği mevcut |
| 10 | [/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-agrisi-neden-olur-belirtiler-ve-cozum-yollari/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-agrisi-neden-olur-belirtiler-ve-cozum-yollari/) | 198 | 36865 | Blog içeriği mevcut |
| 11 | [/ayak-sagligi-hakkinda-bilgiler/ice-basma-gunluk-hayatimizi-nasil-etkiler/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ice-basma-gunluk-hayatimizi-nasil-etkiler/) | 178 | 7478 | Blog içeriği mevcut |
| 12 | [/ayak-sagligi-hakkinda-bilgiler/dizlikle-diz-agrilarina-son-diz-sagliginizi-koruyun/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/dizlikle-diz-agrilarina-son-diz-sagliginizi-koruyun/) | 150 | 6473 | Blog içeriği mevcut |
| 13 | [/footbalance/ice-basma-overpronasyon-nedir/](https://footbalance.com.tr/footbalance/ice-basma-overpronasyon-nedir/) | 138 | 6437 | Blog içeriği mevcut |
| 14 | [/ayak-sagligi-hakkinda-bilgiler/futbol-tabanligi-ortopedik/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/futbol-tabanligi-ortopedik/) | 128 | 1630 | Blog içeriği mevcut |
| 15 | [/ayak-sagligi-hakkinda-bilgiler/ayak-bilegi-koruyucu-desteklerinin-onemi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayak-bilegi-koruyucu-desteklerinin-onemi/) | 100 | 10306 | Blog içeriği mevcut |
| 16 | [/uncategorized-tr/asil-tendiniti-icin-tabanlik-ve-ayakkabi-destegi/](https://footbalance.com.tr/uncategorized-tr/asil-tendiniti-icin-tabanlik-ve-ayakkabi-destegi/) | 99 | 1531 | Blog içeriği mevcut |
| 17 | [/ayak-sagligi-hakkinda-bilgiler/ayakta-su-toplamasi-nedenleri-ve-onleme-yontemleri/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayakta-su-toplamasi-nedenleri-ve-onleme-yontemleri/) | 96 | 35115 | Blog içeriği mevcut |
| 18 | [/footbalance/kisiye-ozel-tabanlik/](https://footbalance.com.tr/footbalance/kisiye-ozel-tabanlik/) | 87 | 2218 | Blog içeriği mevcut |
| 19 | [/ayak-sagligi-hakkinda-bilgiler/morton-noromasi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/morton-noromasi/) | 78 | 11954 | Blog içeriği mevcut |
| 20 | [/ortopedik-tabanliklar/silikon-tabanlik-rehberi/](https://footbalance.com.tr/ortopedik-tabanliklar/silikon-tabanlik-rehberi/) | 77 | 8137 | Blog içeriği mevcut |
| 21 | [/uncategorized-tr/ayakkabi-numarasi-nasil-olculur/](https://footbalance.com.tr/uncategorized-tr/ayakkabi-numarasi-nasil-olculur/) | 76 | 20046 | Blog içeriği mevcut |
| 22 | [/uncategorized-tr/ayaklarin-ice-basmasi-overpronasyon-belirtileri-ve-tabanlik-destegi/](https://footbalance.com.tr/uncategorized-tr/ayaklarin-ice-basmasi-overpronasyon-belirtileri-ve-tabanlik-destegi/) | 74 | 6107 | Blog içeriği mevcut |
| 23 | [/ayak-sagligi-hakkinda-bilgiler/shin-splints-nedir-ve-nasil-onlenir/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/shin-splints-nedir-ve-nasil-onlenir/) | 72 | 1855 | Blog içeriği mevcut |
| 24 | [/ayak-sagligi-hakkinda-bilgiler/hamilelikte-ayak-agrisi-neden-olur-ve-nasil-gecer-kisiye-ozel-tabanliklarin-etkileri-neler/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/hamilelikte-ayak-agrisi-neden-olur-ve-nasil-gecer-kisiye-ozel-tabanliklarin-etkileri-neler/) | 70 | 16583 | Blog içeriği mevcut |
| 25 | [/uncategorized-tr/ayak-tabani-anatomisi-ve-agri-noktalari-hangi-bolge-neyi-anlatir/](https://footbalance.com.tr/uncategorized-tr/ayak-tabani-anatomisi-ve-agri-noktalari-hangi-bolge-neyi-anlatir/) | 68 | 6813 | Blog içeriği mevcut |
| 26 | [/footbalance/ayakkabi-ici-tabanlik-rehberi-hangi-tabanlik-size-uygun/](https://footbalance.com.tr/footbalance/ayakkabi-ici-tabanlik-rehberi-hangi-tabanlik-size-uygun/) | 66 | 1881 | Blog içeriği mevcut |
| 27 | [/uncategorized-tr/duz-taban-ayak-nedir-belirtileri-turleri-ve-tabanlik-yaklasimi/](https://footbalance.com.tr/uncategorized-tr/duz-taban-ayak-nedir-belirtileri-turleri-ve-tabanlik-yaklasimi/) | 65 | 18974 | Blog içeriği mevcut |
| 28 | [/uncategorized-tr/topuk-dikeni-i-cin-tabanlik-neye-gore-secilir-hangi-destek-gerekir/](https://footbalance.com.tr/uncategorized-tr/topuk-dikeni-i-cin-tabanlik-neye-gore-secilir-hangi-destek-gerekir/) | 60 | 2085 | Blog içeriği mevcut |
| 29 | [/ayak-sagligi-hakkinda-bilgiler/ortopedik-tabanlik-rehberi-ayak-sagligi-ve-konfor-icin-tam-cozum/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ortopedik-tabanlik-rehberi-ayak-sagligi-ve-konfor-icin-tam-cozum/) | 48 | 2132 | Blog içeriği mevcut |
| 30 | [/ayak-sagligi-hakkinda-bilgiler/is-ayakkabisi-tabanligi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/is-ayakkabisi-tabanligi/) | 48 | 1050 | Blog içeriği mevcut |
| 31 | [/ayak-sagligi-hakkinda-bilgiler/ayak-parmagi-agrisi-tabanlik/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayak-parmagi-agrisi-tabanlik/) | 44 | 16170 | Blog içeriği mevcut |
| 32 | [/en/](https://footbalance.com.tr/en/) | 44 | 933 | Sunucuda canonical yönlendirmesi mevcut |
| 33 | [/ayak-sagligi-hakkinda-bilgiler/halluks-valgus-tabanlik-secimi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/halluks-valgus-tabanlik-secimi/) | 43 | 924 | Blog içeriği mevcut |
| 34 | [/ortopedik-tabanliklar/eva-tpu-ve-termoplastik-taban-nedir-tabanlik-materyalleri-rehberi/](https://footbalance.com.tr/ortopedik-tabanliklar/eva-tpu-ve-termoplastik-taban-nedir-tabanlik-materyalleri-rehberi/) | 42 | 5539 | Blog içeriği mevcut |
| 35 | [/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-sagligi-ve-dogru-tabanlik-secim-rehberi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-sagligi-ve-dogru-tabanlik-secim-rehberi/) | 37 | 16970 | Blog içeriği mevcut |
| 36 | [/ayak-sagligi-hakkinda-bilgiler/ozel-tabanlik-nasil-yaptirilir/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ozel-tabanlik-nasil-yaptirilir/) | 37 | 1257 | Blog içeriği mevcut |
| 37 | [/uncategorized-tr/kompresyon-corabi-nasil-secilir-beden-basinc-ve-kullanim/](https://footbalance.com.tr/uncategorized-tr/kompresyon-corabi-nasil-secilir-beden-basinc-ve-kullanim/) | 33 | 1346 | Blog içeriği mevcut |
| 38 | [/ortopedik-tabanliklar/ayakkabi-tabanligi-secim-rehberi/](https://footbalance.com.tr/ortopedik-tabanliklar/ayakkabi-tabanligi-secim-rehberi/) | 32 | 1752 | Blog içeriği mevcut |
| 39 | [/ayak-sagligi-hakkinda-bilgiler/en-iyi-ortopedik-tabanlik-hangisi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/en-iyi-ortopedik-tabanlik-hangisi/) | 31 | 954 | Blog içeriği mevcut |
| 40 | [/kisiye-ozel-tabanlik-yorumlari/](https://footbalance.com.tr/kisiye-ozel-tabanlik-yorumlari/) | 31 | 778 | İçe aktarılan içerik mevcut |
| 41 | [/ayak-sagligi-hakkinda-bilgiler/kosu-tabanligi-nasil-secer/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/kosu-tabanligi-nasil-secer/) | 29 | 569 | Blog içeriği mevcut |
| 42 | [/ayak-sagligi-hakkinda-bilgiler/hallux-rigidus/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/hallux-rigidus/) | 28 | 661 | Blog içeriği mevcut |
| 43 | [/ayak-sagligi-hakkinda-bilgiler/diyabet-ve-ayak-sagligi-diyabetik-ayak-icin-tabanlik-ve-corap/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/diyabet-ve-ayak-sagligi-diyabetik-ayak-icin-tabanlik-ve-corap/) | 27 | 783 | Blog içeriği mevcut |
| 44 | [/uncategorized-tr/memory-foam-tabanlik-mi-destekleyici-tabanlik-mi-konfor-ve-stabilite/](https://footbalance.com.tr/uncategorized-tr/memory-foam-tabanlik-mi-destekleyici-tabanlik-mi-konfor-ve-stabilite/) | 24 | 3035 | Blog içeriği mevcut |
| 45 | [/uncategorized-tr/silikon-tabanlik-ne-ise-yarar-hangi-durumda-tercih-edilir/](https://footbalance.com.tr/uncategorized-tr/silikon-tabanlik-ne-ise-yarar-hangi-durumda-tercih-edilir/) | 23 | 1764 | Blog içeriği mevcut |
| 46 | [/ayak-sagligi-hakkinda-bilgiler/soguk-havalar-ve-eklem-agrilari/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/soguk-havalar-ve-eklem-agrilari/) | 22 | 7329 | Blog içeriği mevcut |
| 47 | [/uncategorized-tr/pes-cavus-nedir-yuksek-kavisli-ayak-rehberi/](https://footbalance.com.tr/uncategorized-tr/pes-cavus-nedir-yuksek-kavisli-ayak-rehberi/) | 22 | 3349 | Blog içeriği mevcut |
| 48 | [/ortopedik-tabanliklar/ortopedik-ayakkabi-tabani-rehberi-materyaller-secim-ve-kullanim/](https://footbalance.com.tr/ortopedik-tabanliklar/ortopedik-ayakkabi-tabani-rehberi-materyaller-secim-ve-kullanim/) | 22 | 2539 | Blog içeriği mevcut |
| 49 | [/ayak-sagligi-hakkinda-bilgiler/duztaban-pes-planus-icin-3-egzersiz-onerisi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/duztaban-pes-planus-icin-3-egzersiz-onerisi/) | 22 | 2453 | Blog içeriği mevcut |
| 50 | [/ayak-sagligi-hakkinda-bilgiler/ortopedik-tabanlik-hatalari/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ortopedik-tabanlik-hatalari/) | 22 | 926 | Blog içeriği mevcut |

## 8. Tıklama alan eksik içerik veya eşleme adayları

Aşağıdaki liste, trafik taşıyan risk grubunu eksiksiz gösterir. /en/ kodda canonical yönlendirmesine sahip olduğu için bu gruptan çıkarıldı. Yönlendirme veya 404 kararı eski canlı durum doğrulanarak verilmeli.

| URL | Tıklama | Kaynak koda göre durum |
| --- | ---: | --- |
| [/urunler/](https://footbalance.com.tr/urunler/) | 410 | İçeriği eksik geçici sayfa |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/fs4-plantar-fasiit-corap/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/fs4-plantar-fasiit-corap/) | 15 | İçeriği eksik geçici sayfa |
| [/product-category/os1st-coraplar-giyilebilir-destekleyici-urunler/](https://footbalance.com.tr/product-category/os1st-coraplar-giyilebilir-destekleyici-urunler/) | 10 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/cs6-performance-calf-sleeves/](https://footbalance.com.tr/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/cs6-performance-calf-sleeves/) | 9 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/home/](https://footbalance.com.tr/home/) | 8 | İçeriği eksik geçici sayfa |
| [/en/products/](https://footbalance.com.tr/en/products/) | 8 | İçeriği eksik geçici sayfa |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/cs6-performans-kalf-koruyucu/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/cs6-performans-kalf-koruyucu/) | 5 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/br4-bunyon-corap/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/br4-bunyon-corap/) | 4 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/fs4-compression-destek-corap/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/fs4-compression-destek-corap/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/es6-dirsek-destegi/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/es6-dirsek-destegi/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/ta4-air-performans-corap/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/ta4-air-performans-corap/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/ts5-travel-socks/](https://footbalance.com.tr/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/ts5-travel-socks/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/ks7-performans-diz-koruyucu/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/ks7-performans-diz-koruyucu/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/af7-ayak-bilek-destegi/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/af7-ayak-bilek-destegi/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/es3-performans-dirsek-koruyucu/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/es3-performans-dirsek-koruyucu/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/topuk-dikeni-agridan-kurtulusun-anahtari/](https://footbalance.com.tr/ortopedik-tabanliklar/topuk-dikeni-agridan-kurtulusun-anahtari/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/fs4-plantar-fasciitis-socks/](https://footbalance.com.tr/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/fs4-plantar-fasciitis-socks/) | 3 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/as6-performans-kol-destegi/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/as6-performans-kol-destegi/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/quickfit-kisiye-ozel-tabanliklar/quickfit-balance/](https://footbalance.com.tr/ortopedik-tabanlik/quickfit-kisiye-ozel-tabanliklar/quickfit-balance/) | 2 | İçeriği eksik geçici sayfa |
| [/en/ortopedik-tabanlik/quickfit-custom-insoles/quickfit-control/](https://footbalance.com.tr/en/ortopedik-tabanlik/quickfit-custom-insoles/quickfit-control/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/100-custom-medical-range/medical-green-soft/](https://footbalance.com.tr/en/ortopedik-tabanlik/100-custom-medical-range/medical-green-soft/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-medikal-tabanliklari/medical-green-soft/](https://footbalance.com.tr/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-medikal-tabanliklari/medical-green-soft/) | 2 | İçeriği eksik geçici sayfa |
| [/ortopedik-tabanlik/yuzde-deri-ortopedik-serisi/dynamic-profile/](https://footbalance.com.tr/ortopedik-tabanlik/yuzde-deri-ortopedik-serisi/dynamic-profile/) | 2 | İçeriği eksik geçici sayfa |
| [/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/br4-bunion-relief-socks/](https://footbalance.com.tr/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/br4-bunion-relief-socks/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/product-category/yuzde-yuz-kisiye-ozel-medikal-tabanliklari/](https://footbalance.com.tr/product-category/yuzde-yuz-kisiye-ozel-medikal-tabanliklari/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/ws6-performans-bilek-koruyucu/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/ws6-performans-bilek-koruyucu/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ayak-sagligi-hakkinda-bilgiler/saglik-kan-dolasimi-icin-kompresyon-corap-destegi/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/saglik-kan-dolasimi-icin-kompresyon-corap-destegi/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/100-custom-medical-range/medikal-silver/](https://footbalance.com.tr/en/ortopedik-tabanlik/100-custom-medical-range/medikal-silver/) | 2 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik-hakkinda/](https://footbalance.com.tr/ortopedik-tabanlik-hakkinda/) | 1 | İçeriği eksik geçici sayfa |
| [/en/personalized-insoles-reviews/](https://footbalance.com.tr/en/personalized-insoles-reviews/) | 1 | İçeriği eksik geçici sayfa |
| [/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-spor-tabanliklari/100-impact/](https://footbalance.com.tr/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-spor-tabanliklari/100-impact/) | 1 | İçeriği eksik geçici sayfa |
| [/ortopedik-tabanlik/quickfit-kisiye-ozel-tabanliklar/quickfit-casual/](https://footbalance.com.tr/ortopedik-tabanlik/quickfit-kisiye-ozel-tabanliklar/quickfit-casual/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/quickfit-kisiye-ozel-tabanliklar/quickfit-balance-narrow/](https://footbalance.com.tr/ortopedik-tabanlik/quickfit-kisiye-ozel-tabanliklar/quickfit-balance-narrow/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/quickfit-custom-insoles/quickfit-balance/](https://footbalance.com.tr/en/ortopedik-tabanlik/quickfit-custom-insoles/quickfit-balance/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/product-category/quickfit-kisiye-ozel-tabanliklar/](https://footbalance.com.tr/product-category/quickfit-kisiye-ozel-tabanliklar/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-medikal-tabanliklari/medical-silver-kopya/](https://footbalance.com.tr/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-medikal-tabanliklari/medical-silver-kopya/) | 1 | İçeriği eksik geçici sayfa |
| [/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/hv3-bunyon-destek/](https://footbalance.com.tr/ortopedik-tabanlik/os1st-coraplar-giyilebilir-destekleyici-urunler/hv3-bunyon-destek/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/quickfit-custom-insoles/quickfit-casual/](https://footbalance.com.tr/en/ortopedik-tabanlik/quickfit-custom-insoles/quickfit-casual/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/100-custom-medical-range/medical-black/](https://footbalance.com.tr/en/ortopedik-tabanlik/100-custom-medical-range/medical-black/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/ks7-performance-knee-sleeve/](https://footbalance.com.tr/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/ks7-performance-knee-sleeve/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-spor-tabanliklari/100-control/](https://footbalance.com.tr/ortopedik-tabanlik/yuzde-yuz-kisiye-ozel-spor-tabanliklari/100-control/) | 1 | İçeriği eksik geçici sayfa |
| [/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/fs4-compression-bracing-socks/](https://footbalance.com.tr/en/ortopedik-tabanlik/os1st-socks-wearable-support-products/fs4-compression-bracing-socks/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/topuk-dikeni-tabanlik-agridan-kurtulusun-agri-agridan-kurtulusun-anahtari/](https://footbalance.com.tr/ortopedik-tabanliklar/topuk-dikeni-tabanlik-agridan-kurtulusun-agri-agridan-kurtulusun-anahtari/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ayak-sagligi-hakkinda-bilgiler/ayakkabi-tabani-nasil-secilir-en-rahat-ayakkabi-tabani-hangisidir/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayakkabi-tabani-nasil-secilir-en-rahat-ayakkabi-tabani-hangisidir/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-dogru/](https://footbalance.com.tr/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-dogru/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sinin-icin-dogru/](https://footbalance.com.tr/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sinin-icin-dogru/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sin-icin-dogru/](https://footbalance.com.tr/ortopedik-tabanliklar/duz-taban-icin-tabanlik-rehberi-hangi-model-sin-icin-dogru/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/memory-foam-tabanlik-rehberi-kapsamli-kilavuz/](https://footbalance.com.tr/ortopedik-tabanliklar/memory-foam-tabanlik-rehberi-kapsamli-kilavuz/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ayak-sagligi-hakkinda-bilgiler/asil-tendon-yaralanmalari-tedavisi-ayak-sagliginiz-icin-oneriler/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/asil-tendon-yaralanmalari-tedavisi-ayak-sagliginiz-icin-oneriler/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-agrisi-neder-belirtiler-ve-cozum-yollari](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ayak-tabani-agrisi-neder-belirtiler-ve-cozum-yollari) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ayak-sagligi-hakkinda-bilgiler/ortopedik-tabanlik-rehberi-ayak-sagligi-hakkinda-tam-cozum/](https://footbalance.com.tr/ayak-sagligi-hakkinda-bilgiler/ortopedik-tabanlik-rehberi-ayak-sagligi-hakkinda-tam-cozum/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ayak-tabani-hakkinda-bilgiler/ayak-tabani-agrisi-neden-olur-belirtiler-ve-cozum-yollari/](https://footbalance.com.tr/ayak-tabani-hakkinda-bilgiler/ayak-tabani-agrisi-neden-olur-belirtiler-ve-cozum-yollari/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/ortopedik-tabanliklar/duz-taban-icin-duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-icin-dogru/](https://footbalance.com.tr/ortopedik-tabanliklar/duz-taban-icin-duz-taban-icin-tabanlik-rehberi-hangi-model-sizin-icin-dogru/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |
| [/quickfit-control/](https://footbalance.com.tr/quickfit-control/) | 1 | Eşleme/route bulunamadı; HTTP kontrolü gerekli |

## 9. Kaynaklar ve sonraki bağımlılıklar

Yerel kaynaklar:

- Kullanıcının PDF'si: /Users/ugur/Downloads/footbalance.com.tr Yeni Tasarım Geçişi — SEO Yönergesi.pdf
- Kullanıcının Search Console raporu: /Users/ugur/Downloads/https___footbalance.com.tr.xlsx; “Sayfa sayısı” A1:E606.
- src/lib/seo.ts, src/server.ts, src/router.tsx, src/lib/i18n/urls.ts, src/lib/i18n/components.tsx.
- src/routes/$.tsx, src/routes/__root.tsx, src/routes/ayak-sagligi-hakkinda-bilgiler.tsx, src/components/site-footer.tsx, src/components/blog-sidebar.tsx, src/components/analytics.tsx.
- src/data/blog-posts.json, legacy-pages.json, legacy-redirects.json, imported-pages.json.
- scripts/import-wordpress.py, scripts/generate-seo.mjs, scripts/verify-migration.mjs.
- docs/seo-migration.md, docs/migration-inventory.json, docs/migration-verification.json.

Resmi kaynaklar, 16 Ekim 2026 tarihinde kontrol edildi:

- [Google: URL değiştirmeden hosting geçişi](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes)
- [Google: URL değişen site geçişleri](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google: Taranabilir sayfalama](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google: Robots.txt kullanım sınırları](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: Sitemap hazırlama](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: FAQ ve llms.txt güncellemeleri, Mayıs/Haziran 2026](https://developers.google.com/search/updates)
- [Web.dev: Core Web Vitals](https://web.dev/articles/vitals)

Beklenen ek veriler: GSC dosyasının dönem ve arama türü bilgisi; sorgu/gün/cihaz dışa aktarımı; PDF'deki “Mevcut Yönlendirmeler” sekmesi; tam WordPress ürün/taxonomy/dil eşleri exportu; hosting ve ölçüm hesaplarının test erişimi. Bu bilgiler olmadan da yukarıdaki kod/veri eksikleri geçerlidir; nihai canlıya çıkış onayı bu doğrulamalar tamamlandıktan sonra verilir.
