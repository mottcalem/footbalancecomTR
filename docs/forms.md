# Başvuru formları

- Randevu: `/randevu` ve `/en/randevu`
- Çözüm ortaklığı: `/cozum-ortagi-ol#basvuru` ve `/en/cozum-ortagi-ol#basvuru`
- İki form ortak `RequestForm` bileşenini ve istemci/sunucu doğrulamasını kullanır.

## Gönderim bağlantısı

Sunucuda `.env.forms.example` içindeki `FORM_WEBHOOK_URL` değerini HTTPS form/CRM servisinizin adresiyle yapılandırın. Servis bearer token istiyorsa `FORM_WEBHOOK_TOKEN` tanımlayın. Bu değerleri `VITE_` değişkenleri olarak yayınlamayın.

`POST /api/requests`, doğrulanmış talebi servise JSON olarak iletir. `type` alanı `appointment` veya `partner`, `language` alanı `tr` veya `en` olur. Randevu taleplerinde seçilen merkezin adı, `centerId` ve `centerAddress` ile birlikte gönderilir. `submittedAt` ve `source` alanları sunucuda eklenir.

Servis ancak talebi gerçekten kaydettiğinde veya teslim ettiğinde bir 2xx yanıt vermelidir. Form, bunun ardından başarı mesajı gösterir. Bağlantı yapılandırılmamışsa 503; teslim başarısızsa 502 döner. Kullanıcının bilgileri formda kalır ve telefonla iletişim seçeneği gösterilir. Randevu talebi, onaylanmış randevu anlamına gelmez.

## Kontrol

`node --test tests/requests.test.ts`
