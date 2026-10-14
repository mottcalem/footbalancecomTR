# FootBalance Türkiye

FootBalance Türkiye web sitesinin frontend uygulamasıdır. Ayak ve basış analizi, kişiye özel ortopedik tabanlık ve merkez/randevu akışı üzerine tasarlanmış, mobil uyumlu ve modern bir landing page ve yönlendirme yapısı içerir.

## Proje Hakkında

- Ayak ve basış sorunlarına yönelik farkındalık oluşturan içerik
- Kişiye özel ortopedik tabanlık anlatımı ve kullanım süreci
- Hizmet noktaları / merkez bulma sayfası
- Randevu oluşturma akışı
- Mobil ve masaüstü uyumlu kullanıcı deneyimi

## Teknoloji Stack

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- Radix UI bileşenleri

## Geliştirme

Ön koşul: Node.js 18+ sürümü yüklü olmalıdır.

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak yerel geliştirme sunucusunda çalışır. Tarayıcıda aşağıdaki adresi açabilirsiniz:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Çözüm ortaklığı formu

SMTP ayarları `.env.forms.example` dosyasında belgelenmiştir. Yerel geliştirmede
bu değerler `.env.local` dosyasından okunur. Yayında aynı değişkenleri hosting
ortamına sunucu ayarı / secret olarak ekleyin; şifreyi Git'e veya `VITE_` değişkenine koymayın.
Port 587 bağlantıları STARTTLS gerektirir. `SMTP_FROM` için SMTP sağlayıcısında
doğrulanmış bir gönderen adresi kullanın. Test alıcısı `PARTNER_FORM_TO` üzerinden
değiştirilir. Çözüm ortaklığı ve röportaj formları kalıcı kayıt oluşturulduğunda başarılı sonuç verir.
SMTP bildirimi başarısız olsa da kayıt korunur ve durumu Excel’e yazılır.
Randevu talepleri mevcut `FORM_WEBHOOK_URL` akışını kullanır.

## Prof. Dr. Gül Baltacı röportajı

Üst duyuru `/prof-dr-gul-baltaci/` sayfasına gider. Sayfadaki kısa video
bittiğinde veya “Devamını İzle” düğmesine basıldığında ad soyad, meslek,
e-posta, telefon ve iletişim onayı formu açılır. Bilgiler kalıcı olarak kaydedildikten sonra kullanıcı tam röportajın YouTube
adresine yönlendirilir. SMTP bildirimi ayrıca gönderilir.
Bildirim alıcısı `INTERVIEW_FORM_TO`, tanımlanmadığında `PARTNER_FORM_TO` olur.

## Kod Kalitesi

```bash
npm run lint
```

## Yapı

```text
src/
  components/
  data/
  hooks/
  lib/
  routes/
public/
```

## Not

Bu proje FootBalance Türkiye markası için özel olarak hazırlanmış bir web arayüzü olup, ürün, merkez ve randevu bilgilerini kullanıcıya sunmaya yönelik bir frontend uygulamasıdır.

## Kalıcı lead kayıtları ve haftalık rapor

Ubuntu / Node.js 24+ kullanılır. `LEADS_DATA_DIR` uygulama sürümlerinin dışında,
`public/` altında olmayan kalıcı bir klasör olmalıdır. Canlı ayarlar
`/etc/footbalance.env` dosyasında saklanır:

```text
LEADS_DATA_DIR=/var/lib/footbalance/leads
LEADS_REPORT_TO=info@onbrands.com.tr
```

SQLite (`leads.sqlite`) asıl kayıttır; eşzamanlı kayıt ve tekrar gönderimleri
korur. Her başvurudan sonra aşağıdaki iki Excel dosyası güncellenir:

- `cozum-ortagi-leadler.xlsx`
- `gul-baltaci-leadler.xlsx`

Dosyalar yalnızca sunucu kullanıcısının erişebildiği klasördedir, web üzerinden
sunulmaz. Excel’ler kaynak bazında ad soyad, e-posta, telefon, meslek/firma,
kayıt tarihi, onay ve bildirim durumunu içerir. Tarihler Türkiye saatindedir.
Kayıtlar dağıtım sonrası korunur. Yedekleme yapılırken bu klasör de dahil edilmeli;
çalışan SQLite veritabanını güvenle kopyalamak için SQLite backup API kullanılır.

`deploy/footbalance-lead-report.timer` pazartesi 09:00 Europe/Istanbul zamanında
rapor gönderir. Excel bağlantıları yalnızca önceki pazartesi 00:00’dan bu pazartesi 00:00’a
kadar gelen kayıtları içerir; sunucudaki Excel’ler tüm kayıtları içerir.
Bağlantılar 7 gün geçerli HMAC imzası gerektirir. Dosyalar özel `reports/`
klasöründe saklanır; imzasız veya süresi dolmuş istekler 403 yanıtı alır.
`LEADS_DOWNLOAD_SECRET` rastgele ve en az 32 karakterlik bir sunucu secret’ı,
`LEADS_REPORT_BASE_URL` HTTPS site adresi olmalıdır. Dosya eki gönderilmez.
Kayıt gelmeyen haftada da sıfır kayıt özeti ve başlıklı Excel dosyalarının bağlantıları gönderilir.
Normal tekrar çalıştırmalarda aynı dönem/alıcı için ikinci e-posta gönderilmez.
SMTP hatasında servis 15 dakika sonra yeniden dener. SMTP kabulünden hemen sonra
süreç kapanırsa teslim bilgisinin kaydından önce oluşan bu dar aralıkta aynı
rapor tekrar gönderilebilir.

Canlı sürüm `/var/www/footbalance-current` sembolik bağlantısıyla seçilir.
Uygulama servisi için `deploy/footbalance-leads.conf` drop-in dosyası kullanılır.
Rapor servisi aynı sürümdeki kodu ve `/etc/footbalance.env` ayarlarını kullanır.

```bash
systemctl enable --now footbalance-lead-report.timer
systemctl list-timers footbalance-lead-report.timer
systemctl start footbalance-lead-report.service
journalctl -u footbalance-lead-report.service
```

Yalnızca Excel dosyalarını yeniden üretmek için (e-posta göndermez):

```bash
node --env-file=.env.local scripts/weekly-lead-report.ts --export-only
```

Yerel geliştirmede `.env.local` içindeki `LEADS_DATA_DIR` `.data/leads` klasörüne
ayarlanır. `.data` Git’e dahil edilmez. Otomatik raporun sunucuda etkin olması,
bu bilgisayarın açık olmasına bağlı değildir. Önceki sürümlerde yalnızca e-posta
iletilen başvurular otomatik olarak geriye dönük içe alınmaz.
