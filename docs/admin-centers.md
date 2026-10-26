# Hizmet noktaları yönetimi

Panel: `https://footbalance.com.tr/admin`. Tek yönetici hesabı, 8 saatlik sunucu oturumu. Hizmet noktası adı, yetkili kişi, telefonlar, adres, e-posta, harita ve web bağlantıları, şehir/bölge ve yayın durumu düzenlenebilir. Formda sıralama alanı bulunmaz; sıralama ana listedeki sürükle-bırak ile yönetilir. Yeni noktalar listenin sonuna eklenir; düzenleme mevcut sırayı korur. Şehir / Bölge, Türkiye illeri ve mevcut bölge/yurt dışı kayıtlarından oluşan listeden seçilir. Ana merkez seçimi gösterilmez; mevcut değer sunucuda korunur, yeni noktalar bayi olarak oluşturulur. Ana listede şehir filtresi ve metin araması birlikte kullanılabilir. Liste sayfa başına 15 kayıt gösterir; yalnız listenin altında sayfa numaraları ile Önceki/Sonraki bağlantıları bulunur. Arama ve şehir seçimi sayfalar arasında korunur; yeni filtreleme ilk sayfadan başlar.

Sıralama için satırın solundaki ⋮⋮ tutamacı sürüklenir; klavyeyle tutamaç odaktayken ↑ / ↓ kullanılabilir. Değişiklikler “Sıralamayı kaydet” ile kalıcı olur; iptal düğmesi kaydedilmemiş sıralamayı geri alır. Yalnız görüntülenen sayfadaki kayıtlar kendi yerleri arasında sıralanır; filtre dışında kalan kayıtların göreli sırası korunur. Kayıt başka bir işlemde değişmişse kaydetme reddedilir ve listeyi yenileme istenir. Sıralama güncellemesi oturum, kaynak ve CSRF kontrolleri ardından tek veritabanı transaction içinde uygulanır. “Yayında” kapalı kayıtlar halka açık listelerde ve randevu seçiminde gösterilmez. Kalıcı silme ayrıca onay kutusu gerektirir.

Mevcut 84 noktanın kimlikleri korunur. Yeni kayıtlar kalıcı rastgele kimlik kullanır; sıralama, gizleme ve silme başka bir kaydın randevu kimliğini değiştirmez. Aynı kaydın eski formdan kaydedilmesi HTTP 409 ile engellenir.

Telefonlar “+ Numara ekle” ile en fazla beş ayrı alana girilir; kullanılmayan alanlar kaldırılabilir. Eski tireyle ayrılmış telefonlar düzenleme formunda ayrı alanlara açılır. Kayıtlı telefonlar bayi kartında ayrı satırlarda, randevu ekranında ayrı arama düğmelerinde gösterilir. Her numaranın kendi `tel:` bağlantısı vardır; “Bayiyi Ara” ana düğmesi ilk numarayı arar.

## Sunucu ayarları

`/etc/footbalance.env` içinde yalnız sunucuya yüklenen ayarlar:

```dotenv
DATABASE_URL=postgresql://footbalancecomtr_user:URL_ENCODED_PASSWORD@127.0.0.1:5432/footbalancecomtr_db
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=SALT_HEX:SCRYPT_HASH_HEX
ADMIN_PUBLIC_ORIGIN=https://footbalance.com.tr
```

Şifre özeti Node scrypt varsayılan N=16384, r=8, p=1, 64 byte çıktı ile hesaplanır. Açık admin şifresi uygulama ayarlarında tutulmaz. İlk kurulum bilgileri sunucuda yalnız root erişimli `/root/footbalance-admin-credentials.json` dosyasındadır. Bu dosyayı git'e eklemeyin.

Veritabanı kullanıcısı süper kullanıcı değildir; yalnız bu veritabanı için oluşturulmuştur. PostgreSQL `127.0.0.1:5432` üzerinde dinler. Uzaktan erişim için:

```bash
ssh -i ~/.ssh/minatoi_deploy -p 25416 -N -L 15432:127.0.0.1:5432 root@45.43.154.82
```

Ardından veritabanı istemcisinde host `127.0.0.1`, port `15432`, veritabanı `footbalancecomtr_db`, kullanıcı `footbalancecomtr_user` ve verilen şifre kullanılır.

## Şema ve ilk aktarım

`DATABASE_URL` yüklü iken `node scripts/migrate-centers.mjs` çalıştırılır. İşlem tek transaction ve advisory lock kullanır. `deploy/centers-seed.json` mevcut kayıtların ilk kurulum anlık görüntüsüdür; sonraki değişiklikler veritabanında saklanır. Migration ikinci kez çalışınca düzenlemeleri ezmez ve silinen kayıtları yeniden oluşturmaz.

Yerelde `DATABASE_URL` tanımlanmadığında halka açık ekranlar mevcut sabit bayi listesini kullanır; admin paneli 503 döner. `DATABASE_URL` tanımlıysa eksik şema veya bağlantı hatası gizlenmez.

## Doğrulama

`npx tsc --noEmit`, ilgili dosyalarda ESLint, `npm run build` ve mevcut form testleri çalıştırılır. `tests/admin-centers.test.mjs` gerçek HTTP üzerinde giriş, yanlış şifre, oturum, kaynak/CSRF koruması, URL doğrulama, ekleme, düzenleme, yayın durumu, eski sürüm çakışması, silme ve çıkış işlemlerini sınar. Test geçici bir nokta oluşturur ve temizler; ayrı ön kontrol servisinde çalıştırılmalıdır.

```bash
ADMIN_TEST_BASE_URL=http://127.0.0.1:13004 \
ADMIN_TEST_CREDENTIALS_FILE=/root/footbalance-admin-credentials.json \
node --test tests/admin-centers.test.mjs
```

Admin cevapları `no-store`, `noindex` ve CSP başlıkları kullanır. Oturum çerezleri HttpOnly, SameSite=Strict ve HTTPS'te Secure'dür. Oturum tokenleri veritabanında SHA-256 özetiyle saklanır. Hesap başına 15 dakikada en fazla 10 giriş denemesi kabul edilir. Kimlik doğrulama, kaynak/CSRF kontrolü ve doğrulama her yazma isteğinde sunucuda yapılır.
