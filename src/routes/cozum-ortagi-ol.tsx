import { existingPageHead } from "@/lib/seo";
import { RequestForm } from "@/components/request-form";
import { translate, useTranslation, LanguageSwitcher } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import techImage from "@/assets/technology-scan.jpg";
import finalImage from "@/assets/final-movement.jpg";
import logo from "@/assets/footbalance-logo.svg";

export const Route = createFileRoute("/cozum-ortagi-ol")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) =>
    existingPageHead(
      "/cozum-ortagi-ol",
      match.search.lang,
      translate("Çözüm Ortağı Ol | FootBalance Türkiye", match.search.lang),
      translate(
        "FootBalance çözüm ortaklığı ile kendi merkezinizde 10 dakikada ayak ve basış analizi yapın, %100 kişiye özel ortopedik tabanlık şekillendirin. Başvuru formunu doldurun, sizi arayalım.",
        match.search.lang,
      ),
    ),
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
  [
    "İSPATLANMIŞ",
    "Finlandiya Sağlık Bilimleri Enstitüsü ve Salzburg Üniversitesi'nde yapılan bilimsel çalışmalar.",
  ],
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
  [
    "Kimler çözüm ortağı olabilir?",
    "Fizyoterapi klinikleri, ortopedi ve protez-ortez merkezleri, spor sağlığı merkezleri, podoloji ve ayak sağlığı uygulayıcıları ile ilgili perakende noktaları başvurabilir.",
  ],
  [
    "Merkezimde ne kadar alana ihtiyaç var?",
    "MyFootBalance 3D sistemi kompakt bir kiosk yapısındadır; analiz ve şekillendirme alanı için sınırlı bir kullanım alanı yeterlidir. Detaylar görüşmede paylaşılır.",
  ],
  [
    "Eğitim ve teknik destek veriliyor mu?",
    "Evet. Uygulama eğitimi, sistem kurulumu, teknik destek ve satış sonrası süreç FootBalance Türkiye ekibi tarafından yürütülür.",
  ],
  [
    "Tabanlık şekillendirme ne kadar sürüyor?",
    "Analiz ve kişiye özel şekillendirme aynı ziyaret içinde, yaklaşık 10 dakikada tamamlanabilir.",
  ],
  [
    "Başvurudan sonra süreç nasıl ilerliyor?",
    "Formu ilettikten sonra ekibimiz sizi arar, merkezinizin ihtiyaçlarını değerlendirir ve iş birliği modelini birlikte planlarız.",
  ],
];

function BrandButton({
  children,
  onClick,
  className = "",
  variant = "appointment",
  type = "button",
  form,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "appointment" | "soft" | "quiet";
  type?: "button" | "submit";
  form?: string;
}) {
  return (
    <Button
      type={type}
      form={form}
      variant={variant}
      size="touch"
      className={className}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function PartnerPage() {
  const { tx } = useTranslation();
  const [menu, setMenu] = useState(false);
  const scrollToForm = () => {
    track("partner_cta_click");
    document.getElementById("basvuru")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-2 px-4 sm:gap-6 sm:px-5 lg:px-8">
          <Link
            to="/"
            reloadDocument
            aria-label={tx("FootBalance Türkiye ana sayfa")}
            className="shrink-0"
          >
            <img src={logo} alt="FootBalance" className="h-8 w-auto" />
          </Link>
          <nav
            aria-label={tx("Ana menü")}
            className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex"
          >
            <Link to="/">{tx("Ana Sayfa")}</Link>
            <a href="#kazanim">{tx("Ne Kazandırır?")}</a>
            <a href="#sistem">{tx("3D Sistem")}</a>
            <a href="#referanslar">{tx("Referanslar")}</a>
            <a href="#sss-ortak">{tx("Sık Sorulan Sorular")}</a>
            <Link to="/ayak-sagligi-hakkinda-bilgiler/">{tx("Blog")}</Link>
          </nav>
          <BrandButton onClick={scrollToForm} className="ml-auto hidden sm:inline-flex lg:ml-0">
            {tx("Başvuru Yap")}
          </BrandButton>
          <LanguageSwitcher />
          <Button
            aria-label={tx("Menüyü aç")}
            variant="ghost"
            size="icon"
            className="ml-auto h-11 w-11 shrink-0 lg:hidden"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </Button>
        </div>
        {menu && (
          <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden">
            <Link className="py-3" to="/" onClick={() => setMenu(false)}>
              {tx("Ana Sayfa")}
            </Link>
            <a className="py-3" href="#kazanim" onClick={() => setMenu(false)}>
              {tx("Ne Kazandırır?")}
            </a>
            <a className="py-3" href="#sistem" onClick={() => setMenu(false)}>
              {tx("3D Sistem")}
            </a>
            <a className="py-3" href="#referanslar" onClick={() => setMenu(false)}>
              {tx("Referanslar")}
            </a>
            <a className="py-3" href="#sss-ortak" onClick={() => setMenu(false)}>
              {tx("Sık Sorulan Sorular")}
            </a>
            <Link
              to="/ayak-sagligi-hakkinda-bilgiler/"
              className="py-3"
              onClick={() => setMenu(false)}
            >
              {tx("Blog")}
            </Link>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-12 md:grid-cols-12 md:py-20 lg:px-8">
            <div className="md:col-span-5">
              <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">
                {tx("FootBalance Çözüm Ortaklığı")}
              </p>
              <h1 className="max-w-[16ch] text-[40px] font-semibold leading-[1.04] text-foreground sm:text-5xl lg:text-[60px]">
                {tx("Kendi merkezinde")}
                <br />
                {tx("ayak analizi yap.")}
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted-foreground">
                {tx(
                  "Sadece 10 dakika içinde gelişmiş ayak ve basış analizi yapın, danışanınıza aynı ziyarette %100 kişiye özel ortopedik tabanlığını şekillendirin.",
                )}
              </p>
              <p className="mt-5 text-sm font-semibold leading-6">
                {tx(
                  "Patentli teknoloji • Ücretsiz eğitim• Sürekli teknik destek • Pazarlama desteği",
                )}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <BrandButton onClick={scrollToForm} className="sm:min-h-14">
                  {tx("Çözüm Ortağı Ol")} <ArrowRight />
                </BrandButton>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {tx("Türkiye genelinde yetkili merkez ağına katılın.")}
              </p>
            </div>
            <div className="md:col-span-7">
              <video
                src="/videos/footbalance-partner.mp4"
                poster="/videos/footbalance-partner-poster.jpg"
                width={1920}
                height={726}
                aria-label={tx("FootBalance merkezinde ayak ve basış analizi uygulaması")}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="aspect-[1920/726] w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </section>

        <section aria-label={tx("Çözüm ortaklığı güvencesi")} className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-3 px-5 py-8 md:grid-cols-4 md:gap-4 lg:px-8">
            {[
              tx("Finlandiya Teknolojisi"),
              tx("10 Dakikada Uygulama"),
              tx("Medikal & Spor Serileri"),
              tx("Kurulum ve Eğitim Desteği"),
            ].map((x) => (
              <div
                key={x}
                className="flex min-h-12 items-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold shadow-sm"
              >
                {tx(x)}
              </div>
            ))}
          </div>
        </section>

        <section id="kazanim" className="bg-background">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center lg:px-8 lg:py-28">
            <div className="md:col-span-6">
              <p className="text-sm font-bold uppercase text-muted-foreground">
                {tx("Merkeziniz için değer")}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
                {tx("FootBalance teknolojisi merkezinize ne kazandırır?")}
              </h2>
              <ul className="mt-8 space-y-4">
                {advantages.map((a) => (
                  <li
                    key={a}
                    className="flex gap-3 rounded-xl border border-border bg-muted px-5 py-4"
                  >
                    <Check className="mt-0.5 size-5 shrink-0 text-mint-deep" aria-hidden="true" />
                    <span className="text-[15px] leading-6">{tx(a)}</span>
                  </li>
                ))}
              </ul>
              <BrandButton className="mt-8" onClick={scrollToForm}>
                {tx("Detaylı Bilgi Al")} <ArrowRight />
              </BrandButton>
            </div>
            <div className="md:col-span-6">
              <video
                src="/videos/footbalance-partner-benefits.mp4"
                poster="/videos/footbalance-partner-benefits-poster.jpg"
                width={1080}
                height={1920}
                aria-label={tx("Kişiye özel şekillendirilen FootBalance ortopedik tabanlık")}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="mx-auto aspect-[9/16] max-h-[720px] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </section>

        <section className="bg-secondary">
          <div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28">
            <h2 className="text-3xl font-semibold sm:text-5xl">{tx("Neden FootBalance?")}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              {tx("Bilimsel temelli, uygulaması hızlı ve danışan memnuniyeti yüksek bir sistem.")}
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {pillars.map(([title, text]) => (
                <div key={title} className="rounded-xl bg-background p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide">{tx(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{tx(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="sistem"
          className="overflow-hidden border-y border-[#DCF6F3] bg-[#F7FAF9] text-foreground"
        >
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center lg:px-8 lg:py-28">
            <div className="md:col-span-5">
              <p className="inline-flex items-center rounded-full bg-[#DCF6F3] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#00263E]">
                {tx("MyFootBalance 3D")}
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#00263E] sm:text-5xl">
                {tx("Merkezinize kurulan")}
                <br />
                {tx("3D analiz sistemi.")}
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#00263E]/70">
                {tx("Analizden şekillendirmeye kadar tüm süreci tek sistem üzerinden yönetin.")}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {systemSpecs.map((s) => (
                  <div
                    key={s}
                    className="rounded-xl border border-[#DCF6F3] bg-background/60 px-5 py-4 text-[15px] font-semibold leading-6 text-[#00263E]"
                  >
                    {tx(s)}
                  </div>
                ))}
              </div>
              <BrandButton variant="soft" className="mt-8" onClick={scrollToForm}>
                {tx("Çözüm Ortağı Olun!")}
              </BrandButton>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#DCF6F3] bg-background shadow-sm md:col-span-7">
              <img
                src={finalImage}
                loading="lazy"
                width={1504}
                height={1008}
                alt={tx("MyFootBalance 3D ayak analiz sistemi kullanımı")}
                className="aspect-[3/2] w-full object-cover"
              />
              <span
                aria-hidden="true"
                className="scan-line absolute inset-x-0 top-0 h-px bg-accent"
              />
            </div>
          </div>
        </section>

        <section id="referanslar" className="bg-muted">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  {tx("Çözüm ortaklarımız ne diyor?")}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  {tx(
                    "Türkiye genelinde klinikler, ortopedi merkezleri ve spor sağlığı uzmanları FootBalance ile çalışıyor.",
                  )}
                </p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  aria-label={tx("Önceki")}
                  className="grid size-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-secondary"
                  onClick={(e) => scrollRow(e.currentTarget, -1)}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  aria-label={tx("Sonraki")}
                  className="grid size-9 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-secondary"
                  onClick={(e) => scrollRow(e.currentTarget, 1)}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="ref-row mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
              {references.map(([name, quote, meta]) => (
                <blockquote
                  key={name}
                  className="snap-start shrink-0 w-[280px] sm:w-[340px] rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    {tx("“")}
                    {tx(quote)}
                    {tx("”")}
                  </p>
                  <footer className="mt-4 border-t border-border pt-3">
                    <p className="text-sm font-semibold">{tx(name)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{tx(meta)}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="sss-ortak" className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-12 md:grid-cols-12 lg:px-8 lg:py-16">
            <h2 className="text-2xl font-semibold sm:text-3xl md:col-span-5 md:pr-6">
              {tx("Başvurmadan önce bilmek isteyebileceklerin.")}
            </h2>
            <div className="md:col-span-7">
              <Accordion type="single" collapsible>
                {partnerFaq.map(([q, a], i) => (
                  <AccordionItem key={q} value={`p${i}`}>
                    <AccordionTrigger className="py-4 text-sm sm:text-base">
                      {tx(q)}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-6 text-muted-foreground">
                      {tx(a)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <BrandButton className="mt-6" onClick={scrollToForm}>
                {tx("Başvuru Formuna Git")}
              </BrandButton>
            </div>
          </div>
        </section>

        <section id="basvuru" className="bg-secondary">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 lg:px-8 lg:py-28">
            <div className="md:col-span-5">
              <h2 className="text-3xl font-semibold sm:text-5xl">
                {tx("FootBalance çözüm ortaklığı")}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {tx(
                  "Formu doldurun, ekibimiz sizi arasın. Merkezinizin ihtiyaçlarını birlikte değerlendirelim.",
                )}
              </p>
              <ol className="mt-8 space-y-4">
                {[
                  "1. Başvuru formunu iletin",
                  "2. Ekibimiz sizi arayıp ihtiyacınızı dinlesin",
                  "3. İş birliği modelini birlikte planlayalım",
                  "4. Kurulum, eğitim ve uygulamaya başlayın",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-primary/15 bg-background p-5 shadow-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
                    >
                      {index + 1}
                    </span>
                    <span className="text-base font-semibold leading-7 text-foreground sm:text-lg">
                      <span className="sr-only">{index + 1}. </span>
                      {tx(step).replace(/^\d+\.\s*/, "")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="md:col-span-7">
              <RequestForm type="partner" />
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 border-t border-border bg-background md:hidden">
        <Button className="h-full rounded-none" onClick={scrollToForm}>
          {tx("Çözüm Ortağı Ol")}
        </Button>
      </div>
    </div>
  );
}
