import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import techImage from "@/assets/technology-scan.jpg";
import insoleImage from "@/assets/insole-product.jpg";
import finalImage from "@/assets/final-movement.jpg";
import logo from "@/assets/footbalance-logo.svg";

export const Route = createFileRoute("/cozum-ortagi-ol")({
  head: () => ({
    meta: [
      { title: "Çözüm Ortağı Ol | FootBalance Türkiye" },
      { name: "description", content: "FootBalance çözüm ortaklığı ile kendi merkezinizde 10 dakikada ayak ve basış analizi yapın, %100 kişiye özel ortopedik tabanlık şekillendirin. Başvuru formunu doldurun, sizi arayalım." },
      { property: "og:title", content: "Çözüm Ortağı Ol | FootBalance Türkiye" },
      { property: "og:description", content: "Kendi merkezinizde FootBalance teknolojisi: 10 dakikada analiz, kişiye özel ortopedik tabanlık ve rekabette farklılaşma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cozum-ortagi-ol" }],
  }),
  component: PartnerPage,
});

const track = (event: string, data: Record<string, string> = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("footbalance:analytics", { detail: { event, ...data } }));
};

const scrollRow = (btn: HTMLElement, dir: number) => {
  const row = btn.closest("section")?.querySelector(".ref-row") as HTMLElement | null;
  if (!row) return;
  row.scrollBy({ left: dir * (row.clientWidth * 0.85), behavior: "smooth" });
};

const advantages = [
  "10 dakika içinde kendi merkezinizde %100 kişiye özel ortopedik tabanlık şekillendirme",
  "Medikal, spor ve günlük kullanım serileri ile farklı kategorilerde çözüm",
  "Defalarca revize edilebilen ve ayakkabı ile tam uyum sağlayan tabanlık",
  "Bütüncül tedaviye hızlı ve etkili destek",
  "Rekabette farklılaşma ve yüksek hasta memnuniyeti",
];

const pillars: [string, string][] = [
  ["İSPATLANMIŞ", "Finlandiya Sağlık Bilimleri Enstitüsü ve Salzburg Üniversitesi'nde yapılan bilimsel çalışmalar."],
  ["ETKİLİ", "%100 kişiye özel hizmet ile yüksek hasta memnuniyeti."],
  ["DÜŞÜK MALİYET", "Hastalar ve müşteriler için uygun fiyatlı çözüm."],
  ["HASTA KAZANIMI", "Rekabette farklılık kazandırır, yeni danışan getirir."],
];

const systemSpecs = [
  "55 cm dokunmatik ekran",
  "16 adet 4K kamera",
  "10 bin sensörlü basış yüzeyi",
  "3 boyutlu ayak ve basış modelleme",
  "Özel patentli fırın",
  "Tabanlık ve OS1st ürün önerisi",
];

const references: [string, string, string][] = [
  [
    "GTOS Bayrampaşa",
    "Kliniğimizde GTOS terapi yaklaşımıyla birlikte FootBalance analiz sistemini aktif olarak kullanıyoruz. Hastanın ayak basışını hızlı ve doğru şekilde ölçerek kişiye özel tedavi planlamasını güvenle yapabiliyoruz. Analizden uygulamaya kadar tüm sürecin aynı sistem üzerinden ilerlemesi klinik operasyonumuzu kolaylaştırıyor.",
    "Klinik / İstanbul",
  ],
  [
    "Eren Ortopedi Protez Ortez Merkezi",
    "FootBalance ile yaklaşık 8 yıldır çalışıyoruz. Kiosk üzerinden yapılan analizler sayesinde hem biz hem danışanlarımız ayak problemlerini net şekilde görebiliyor. Hızlı üretim, ince ve esnek yapı, farklı ayakkabılarla uyum ve kolay revize edilebilirlik en güçlü yönleri arasında.",
    "Protez & Ortez / 8 yıl",
  ],
  [
    "Clinic Athletic",
    "2017'den bu yana FootBalance ile iş birliğimizde, sporcularımızın ayak biyomekaniğini değerlendirme sürecinde sistemin önemli katkısını görüyoruz. Kişiye özel dinamik tabanlıklar, yürüyüş ve koşuda yük dağılımını dengelerken konfor ve fonksiyonel destek sağlıyor.",
    "Spor Kliniği / 2017'den beri",
  ],
  [
    "Ata Ortopedi",
    "Yaklaşık 10 yıldır FootBalance sistemini aktif olarak kullanıyoruz. Kişiye özel tabanlık üretimi ve hızlı uygulama süreci sayesinde birçok hastamızda ayak ağrısı, basma bozukluğu ve yürüyüş konforunda belirgin iyileşmeler gözlemledik.",
    "Uzm. Fzt. İbrahim Bulut",
  ],
];

const partnerFaq: [string, string][] = [
  ["Kimler çözüm ortağı olabilir?", "Fizyoterapi klinikleri, ortopedi ve protez-ortez merkezleri, spor sağlığı merkezleri, podoloji ve ayak sağlığı uygulayıcıları ile ilgili perakende noktaları başvurabilir."],
  ["Merkezimde ne kadar alana ihtiyaç var?", "MyFootBalance 3D sistemi kompakt bir kiosk yapısındadır; analiz ve şekillendirme alanı için sınırlı bir kullanım alanı yeterlidir. Detaylar görüşmede paylaşılır."],
  ["Eğitim ve teknik destek veriliyor mu?", "Evet. Uygulama eğitimi, sistem kurulumu, teknik destek ve satış sonrası süreç FootBalance Türkiye ekibi tarafından yürütülür."],
  ["Tabanlık şekillendirme ne kadar sürüyor?", "Analiz ve kişiye özel şekillendirme aynı ziyaret içinde, yaklaşık 10 dakikada tamamlanabilir."],
  ["Başvurudan sonra süreç nasıl ilerliyor?", "Formu ilettikten sonra ekibimiz sizi arar, merkezinizin ihtiyaçlarını değerlendirir ve iş birliği modelini birlikte planlarız."],
];

function BrandButton({ children, onClick, className = "", variant = "appointment", type = "button", form }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: "appointment" | "soft" | "quiet"; type?: "button" | "submit"; form?: string }) {
  return <Button type={type} form={form} variant={variant} size="touch" className={className} onClick={onClick}>{children}</Button>;
}

function PartnerPage() {
  const [menu, setMenu] = useState(false);
  const [sent, setSent] = useState(false);
  const scrollToForm = () => { track("partner_cta_click"); document.getElementById("basvuru")?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-6 px-5 lg:px-8">
          <Link to="/" aria-label="FootBalance Türkiye ana sayfa" className="shrink-0"><img src={logo} alt="FootBalance" className="h-8 w-auto" /></Link>
          <nav aria-label="Ana menü" className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex">
            <Link to="/">Ana Sayfa</Link>
            <a href="#kazanim">Ne Kazandırır?</a>
            <a href="#sistem">3D Sistem</a>
            <a href="#referanslar">Referanslar</a>
            <a href="#sss-ortak">Sık Sorulan Sorular</a>
          </nav>
          <BrandButton onClick={scrollToForm} className="ml-auto hidden sm:inline-flex lg:ml-0">Başvuru Yap</BrandButton>
          <Button aria-label="Menüyü aç" variant="ghost" size="icon" className="ml-auto h-11 w-11 lg:hidden" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button>
        </div>
        {menu && (
          <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden">
            <Link className="py-3" to="/" onClick={() => setMenu(false)}>Ana Sayfa</Link>
            <a className="py-3" href="#kazanim" onClick={() => setMenu(false)}>Ne Kazandırır?</a>
            <a className="py-3" href="#sistem" onClick={() => setMenu(false)}>3D Sistem</a>
            <a className="py-3" href="#referanslar" onClick={() => setMenu(false)}>Referanslar</a>
            <a className="py-3" href="#sss-ortak" onClick={() => setMenu(false)}>Sık Sorulan Sorular</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-12 md:grid-cols-12 md:py-20 lg:px-8">
            <div className="md:col-span-5">
              <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">FootBalance Çözüm Ortaklığı</p>
              <h1 className="max-w-[16ch] text-[40px] font-semibold leading-[1.04] text-foreground sm:text-5xl lg:text-[60px]">Kendi merkezinde<br />ayak analizi yap.</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted-foreground">Sadece 10 dakika içinde gelişmiş ayak ve basış analizi yapın, danışanınıza aynı ziyarette %100 kişiye özel ortopedik tabanlığını şekillendirin.</p>
              <p className="mt-5 text-sm font-semibold leading-6">Patentli teknoloji • Ücretsiz  eğitim• Sürekli teknik destek • Pazarlama desteği</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <BrandButton onClick={scrollToForm} className="sm:min-h-14">Çözüm Ortağı Ol <ArrowRight /></BrandButton>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Türkiye genelinde yetkili merkez ağına katılın.</p>
            </div>
            <div className="md:col-span-7"><img src={techImage} width={1504} height={1008} alt="FootBalance merkezinde ayak ve basış analizi uygulaması" className="aspect-[16/11] w-full rounded-2xl object-cover" /></div>
          </div>
        </section>

        <section aria-label="Çözüm ortaklığı güvencesi" className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-3 px-5 py-8 md:grid-cols-4 md:gap-4 lg:px-8">
            {["Finlandiya Teknolojisi", "10 Dakikada Uygulama", "Medikal & Spor Serileri", "Kurulum ve Eğitim Desteği"].map((x) => (
              <div key={x} className="flex min-h-12 items-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold shadow-sm">{x}</div>
            ))}
          </div>
        </section>

        <section id="kazanim" className="bg-background">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center lg:px-8 lg:py-28">
            <div className="md:col-span-6">
              <p className="text-sm font-bold uppercase text-muted-foreground">Merkeziniz için değer</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">FootBalance teknolojisi merkezinize ne kazandırır?</h2>
              <ul className="mt-8 space-y-4">
                {advantages.map((a) => (
                  <li key={a} className="flex gap-3 rounded-xl border border-border bg-muted px-5 py-4">
                    <Check className="mt-0.5 size-5 shrink-0 text-mint-deep" aria-hidden="true" />
                    <span className="text-[15px] leading-6">{a}</span>
                  </li>
                ))}
              </ul>
              <BrandButton className="mt-8" onClick={scrollToForm}>Detaylı Bilgi Al <ArrowRight /></BrandButton>
            </div>
            <div className="md:col-span-6"><img src={insoleImage} loading="lazy" width={1200} height={1008} alt="Kişiye özel şekillendirilen FootBalance ortopedik tabanlık" className="w-full rounded-2xl" /></div>
          </div>
        </section>

        <section className="bg-secondary">
          <div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28">
            <h2 className="text-3xl font-semibold sm:text-5xl">Neden FootBalance?</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Bilimsel temelli, uygulaması hızlı ve danışan memnuniyeti yüksek bir sistem.</p>
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {pillars.map(([title, text]) => (
                <div key={title} className="rounded-xl bg-background p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sistem" className="overflow-hidden border-y border-[#DCF6F3] bg-[#F7FAF9] text-foreground">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center lg:px-8 lg:py-28">
            <div className="md:col-span-5">
              <p className="inline-flex items-center rounded-full bg-[#DCF6F3] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#00263E]">MyFootBalance 3D</p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#00263E] sm:text-5xl">Merkezinize kurulan<br />3D analiz sistemi.</h2>
              <p className="mt-6 text-lg leading-8 text-[#00263E]/70">Analizden şekillendirmeye kadar tüm süreci tek sistem üzerinden yönetin.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {systemSpecs.map((s) => (
                  <div key={s} className="rounded-xl border border-[#DCF6F3] bg-background/60 px-5 py-4 text-[15px] font-semibold leading-6 text-[#00263E]">{s}</div>
                ))}
              </div>
              <BrandButton variant="soft" className="mt-8" onClick={scrollToForm}>Çözüm Ortağı Olun!</BrandButton>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#DCF6F3] bg-background shadow-sm md:col-span-7">
              <img src={finalImage} loading="lazy" width={1504} height={1008} alt="MyFootBalance 3D ayak analiz sistemi kullanımı" className="aspect-[3/2] w-full object-cover" />
              <span aria-hidden="true" className="scan-line absolute inset-x-0 top-0 h-px bg-accent" />
            </div>
          </div>
        </section>

        <section id="referanslar" className="bg-muted">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">Çözüm ortaklarımız ne diyor?</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">Türkiye genelinde klinikler, ortopedi merkezleri ve spor sağlığı uzmanları FootBalance ile çalışıyor.</p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button aria-label="Önceki" className="grid size-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-secondary" onClick={(e) => scrollRow(e.currentTarget, -1)}><ChevronLeft className="size-4" /></button>
                <button aria-label="Sonraki" className="grid size-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-secondary" onClick={(e) => scrollRow(e.currentTarget, 1)}><ChevronRight className="size-4" /></button>
              </div>
            </div>
            <div className="ref-row mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
              {references.map(([name, quote, meta]) => (
                <blockquote key={name} className="snap-start shrink-0 w-[280px] sm:w-[340px] rounded-2xl border border-border bg-background p-5 shadow-sm">
                  <p className="text-[13px] leading-6 text-muted-foreground">“{quote}”</p>
                  <footer className="mt-4 border-t border-border pt-3">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="sss-ortak" className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-12 md:grid-cols-12 lg:px-8 lg:py-16">
            <h2 className="text-2xl font-semibold sm:text-3xl md:col-span-5 md:pr-6">Başvurmadan önce bilmek isteyebileceklerin.</h2>
            <div className="md:col-span-7">
              <Accordion type="single" collapsible>
                {partnerFaq.map(([q, a], i) => (
                  <AccordionItem key={q} value={`p${i}`}>
                    <AccordionTrigger className="py-4 text-sm sm:text-base">{q}</AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-6 text-muted-foreground">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <BrandButton className="mt-6" onClick={scrollToForm}>Başvuru Formuna Git</BrandButton>
            </div>
          </div>
        </section>

        <section id="basvuru" className="bg-secondary">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 lg:px-8 lg:py-28">
            <div className="md:col-span-5">
              <h2 className="text-3xl font-semibold sm:text-5xl">FootBalance çözüm ortaklığı</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">Formu doldurun, ekibimiz sizi arasın. Merkezinizin ihtiyaçlarını birlikte değerlendirelim.</p>
              <ol className="mt-8 space-y-3 text-sm text-muted-foreground">
                <li>1. Başvuru formunu iletin</li>
                <li>2. Ekibimiz sizi arayıp ihtiyacınızı dinlesin</li>
                <li>3. İş birliği modelini birlikte planlayalım</li>
                <li>4. Kurulum, eğitim ve uygulamaya başlayın</li>
              </ol>
            </div>
            <div className="md:col-span-7">
              {sent ? (
                <div className="rounded-2xl bg-background p-8">
                  <span className="grid size-14 place-items-center rounded-full bg-secondary"><Check /></span>
                  <h3 className="mt-6 text-2xl font-semibold">Başvurunuz alındı.</h3>
                  <p className="mt-3 text-muted-foreground">FootBalance Türkiye ekibi en kısa sürede sizinle iletişime geçecek.</p>
                </div>
              ) : (
                <form
                  className="grid gap-4 rounded-2xl bg-background p-6 sm:p-8 md:grid-cols-2"
                  onSubmit={(e) => { e.preventDefault(); track("partner_application_submitted"); setSent(true); }}
                >
                  <label className="block text-sm font-semibold">Ad Soyad<input required name="name" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">Merkez / Firma Adı<input required name="company" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">Telefon<input required type="tel" name="phone" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">E-posta<input required type="email" name="email" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">Şehir<input required name="city" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">Faaliyet Alanı
                    <select required name="field" className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-4 font-normal">
                      <option value="">Seçiniz</option>
                      <option>Fizyoterapi Kliniği</option>
                      <option>Ortopedi / Protez-Ortez Merkezi</option>
                      <option>Spor Sağlığı Merkezi</option>
                      <option>Podoloji / Ayak Sağlığı</option>
                      <option>Perakende / Mağaza</option>
                      <option>Diğer</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold md:col-span-2">Mesajınız <span className="font-normal text-muted-foreground">(isteğe bağlı)</span><textarea name="message" rows={4} className="mt-2 w-full rounded-lg border border-input px-4 py-3 font-normal" /></label>
                  <label className="flex gap-3 text-sm leading-6 md:col-span-2"><input required type="checkbox" className="mt-1 size-5" /> KVKK aydınlatma metnini okudum ve iletişime geçilmesine onay veriyorum.</label>
                  <div className="md:col-span-2"><Button type="submit" variant="appointment" size="wide">Sizi Arayalım</Button></div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <PartnerFooter />
      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 border-t border-border bg-background md:hidden">
        <Button className="h-full rounded-none" onClick={scrollToForm}>Çözüm Ortağı Ol</Button>
      </div>
    </div>
  );
}

function PartnerFooter() {
  const groups: Record<string, string[]> = {
    "FootBalance": ["Hakkımızda", "Teknolojimiz", "Kullanıcı Deneyimleri", "İletişim"],
    "Ayak Sağlığı": ["Ayak Sağlığı Rehberi", "Sık Sorulan Sorular"],
    "Çözüm Ortaklığı": ["Ne Kazandırır?", "3D Sistem", "Referanslar", "Başvuru"],
    "Online": ["Online Mağaza", "Instagram", "YouTube"],
  };
  return (
    <footer className="bg-graphite text-primary-foreground">
      <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-8">
        <img src={logo} alt="FootBalance" className="h-9 w-auto brightness-0 invert" />
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(groups).map(([g, links]) => (
            <div key={g}>
              <h2 className="text-sm font-bold uppercase">{g}</h2>
              <ul className="mt-4 space-y-3 text-sm text-primary-foreground/65">
                {links.map((x) => <li key={x}><span className="min-h-6 text-left">{x}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col justify-between gap-5 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/55 sm:flex-row">
          <p>© 2026 FootBalance Türkiye</p>
          <div className="flex gap-5"><span>KVKK</span><span>Çerez Politikası</span><span>Kullanım Koşulları</span></div>
        </div>
      </div>
    </footer>
  );
}
