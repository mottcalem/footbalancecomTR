# Hakkımızda Sayfası

## Amaç
Footer’daki “Hakkımızda” bağlantısından açılan, mevcut FootBalance Türkiye görünümüyle tamamen uyumlu ve kaynak sayfadaki doğrulanmış marka bilgilerini kullanan yeni bir sayfa oluşturmak.

## Sayfa yapısı
- Mevcut sayfalardaki üst menü, mobil menü, genişlik, tipografi, renkler, butonlar ve footer düzenini koru.
- İlk alanda “Eşsiz Finlandiya Teknolojisi” mesajını; 6 kıta, 50’den fazla ülke, 2.000’in üzerinde lokasyon ve Türkiye’de 50’den fazla merkez bilgisini güçlü ama sade biçimde sun.
- Kaynak sayfadaki gerçek uygulama görsellerini projeye alıp yerel görsel olarak kullan; dış bağlantıya bağımlı bırakma.
- Bilimsel geliştirme yaklaşımı ve 10 dakikada hazırlanan kişiye özel tabanlık sürecini iki kolonlu, kolay taranan bölümlerle anlat.
- Uzman uygulaması ve ürün özelliklerini mevcut kart dilinde göster: 10 dakikada hazırlık, ayakkabı numarasını büyütmeme, yaralanmalara karşı destek ve antibakteriyel teknoloji.
- Kaynak sayfadaki ödülleri kronolojik, kompakt bir zaman çizelgesi/listesi olarak ekle.
- Sayfa sonunda “Merkez Bul” ve “Randevu Al” aksiyonlarını görünür biçimde sun.

## Bağlantılar ve davranış
- Ana sayfa footer’ındaki “Hakkımızda” öğesini `/hakkimizda` sayfasına bağla.
- Hakkımızda sayfasının üst menüsünü ana sayfadaki ilgili bölümlere, merkezlere ve çözüm ortaklığı sayfasına bağla.
- Mobil görünümde menü ve alt aksiyon alanını mevcut site davranışlarıyla aynı tut.

## Teknik detaylar
- `src/routes/hakkimizda.tsx` ile yeni TanStack route oluştur.
- Sayfaya özgü başlık, açıklama, Open Graph bilgileri, Twitter kartı ve canonical adres ekle.
- Görselleri `src/assets` altında sakla; açıklayıcı alternatif metin ve tembel yükleme kullan.
- Mevcut tasarım tokenları ve Button bileşenini kullan; yeni font veya renk sistemi ekleme.
- Masaüstü ve mobil görünümü, footer bağlantısını, sayfa erişimini ve hata kayıtlarını kontrol et.
