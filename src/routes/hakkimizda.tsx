import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, MapPin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/footbalance-logo.svg";
import globalImage from "@/assets/about-global.png";
import analysisImage from "@/assets/about-analysis.jpg";
import productsImage from "@/assets/about-products.jpg";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda | FootBalance Türkiye" },
      { name: "description", content: "FootBalance'ın Finlandiya'da geliştirilen patentli teknolojisini, bilimsel yaklaşımını, küresel merkez ağını ve kişiye özel ortopedik tabanlık deneyimini keşfedin." },
      { property: "og:title", content: "Hakkımızda | FootBalance Türkiye" },
      { property: "og:description", content: "6 kıtada, 50'den fazla ülkede ve 2.000'in üzerinde lokasyonda kişiye özel ortopedik tabanlık teknolojisi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/hakkimizda" }],
  }),
  component: AboutPage,
});

const facts = [
  ["6 kıta", "Küresel deneyim"],
  ["50+ ülke", "Yaygın hizmet ağı"],
  ["2.500+ lokasyon", "Dünya genelinde"],
  ["100+ merkez", "Türkiye genelinde"],
] as const;

const qualities = [
  ["10 dakikada hazır", "Analiz ve kişiye özel şekillendirme aynı ziyaret içinde tamamlanabilir."],
  ["Ayakkabıyla uyumlu", "İnce yapısı sayesinde ayakkabı numaranızı büyütmeden kullanılabilir."],
  ["Hareketi destekler", "Günlük yaşam ve spor sırasında ayağa binen yükün dengelenmesine yardımcı olur."],
  ["Antibakteriyel teknoloji", "Konforlu kullanım için geliştirilen özel tabanlık malzemeleri kullanılır."],
] as const;

const awards = [
  ["2006", "InnoFinland Ödülü", "Finlandiya Cumhurbaşkanı tarafından verilen yenilikçilik ödülü."],
  ["2010", "Yılın Tedarikçisi", "Intersport Finlandiya tarafından verilen sektör ödülü."],
  ["2010", "Best of the Year Finalisti", "Grafia hizmet tasarımı kategorisi."],
  ["2010", "YIC Şampiyonu", "Uluslararası büyüme ve yenilik başarısı."],
  ["2011", "Red Herring Top 100", "Avrupa finalisti ve Global Top 100 kazananı."],
  ["2024", "Best Medical Technology", "London - Sports Technology."],
] as const;

function AboutPage() {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-6 px-5 lg:px-8">
          <Link to="/" aria-label="FootBalance Türkiye ana sayfa" className="shrink-0"><img src={logo} alt="FootBalance" className="h-8 w-auto" /></Link>
          <nav aria-label="Ana menü" className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex">
            <Link to="/" hash="nedir">Kişiye Özel Tabanlık</Link>
            <Link to="/" hash="teknoloji">Nasıl Hazırlanır?</Link>
            <Link to="/" hash="kimler">Kimler İçin?</Link>
            <Link to="/" hash="sss">Sık Sorulan Sorular</Link>
          </nav>
          <Link to="/cozum-ortagi-ol" className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex">Çözüm Ortağı Ol</Link>
          <Link to="/" hash="top" className="hidden sm:inline-flex"><Button type="button" variant="appointment" size="touch">Randevu Al</Button></Link>
          <Button aria-label="Menüyü aç" variant="ghost" size="icon" className="ml-auto h-11 w-11 lg:hidden" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button>
        </div>
        {menu && (
          <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden">
            <Link className="py-3" to="/" onClick={() => setMenu(false)}>Ana Sayfa</Link>
            <Link className="py-3" to="/" hash="nedir" onClick={() => setMenu(false)}>Kişiye Özel Tabanlık</Link>
            <Link className="py-3" to="/" hash="teknoloji" onClick={() => setMenu(false)}>Nasıl Hazırlanır?</Link>
            <Link className="py-3" to="/merkezler" onClick={() => setMenu(false)}>Merkez Bul</Link>
            <Link className="py-3" to="/cozum-ortagi-ol" onClick={() => setMenu(false)}>Çözüm Ortağı Ol</Link>
          </nav>
        )}
      </header>

      <main>
        <section className="bg-secondary">
          <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-14 md:grid-cols-12 md:py-20 lg:px-8">
            <div className="md:col-span-6">
              <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">FootBalance Hakkında</p>
              <h1 className="max-w-[15ch] text-[40px] font-semibold leading-[1.04] sm:text-5xl lg:text-[64px]">Eşsiz Finlandiya teknolojisi.</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted-foreground">FootBalance, patentli ayak analliz, ısı sistemi ve yüksek teknolojiye sahip ürünleriyle kişiye özel ortopedik tabanlık alanında dünyanın önde gelen markalarından biridir.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/merkezler"><Button type="button" variant="appointment" size="touch">Sana En Yakın Merkezi Bul <ArrowRight /></Button></Link>
              </div>
            </div>
            <div className="md:col-span-6"><img src={globalImage} width={603} height={294} alt="FootBalance'ın dünya genelindeki hizmet ağını gösteren harita" className="w-full rounded-2xl border border-border bg-background object-contain p-6" /></div>
          </div>
        </section>

        <section aria-label="FootBalance küresel erişimi" className="bg-secondary">
          <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-2 px-5 pb-8 md:grid-cols-4 md:gap-3 lg:px-8">
            {facts.map(([value, label]) => <div key={value} className="rounded-lg border border-border bg-background px-4 py-3 shadow-sm"><p className="text-lg font-semibold sm:text-xl">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{label}</p></div>)}
          </div>
        </section>

        <section id="hikayemiz" className="bg-background">
          <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-5 py-20 md:grid-cols-12 lg:px-8 lg:py-28">
            <div className="md:col-span-6"><img src={analysisImage} loading="lazy" width={1196} height={1196} alt="FootBalance merkezinde ayak ve basış analizi" className="aspect-square w-full rounded-2xl object-cover" /></div>
            <div className="md:col-span-6 md:pl-6">
              <p className="text-sm font-bold uppercase text-muted-foreground">Bilimsel yaklaşımla geliştirildi</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Tabanlıkların 10 dakikada hazır.</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">FootBalance ürün ve hizmetleri; doktorların, sağlık uzmanlarının, profesyonel sporcuların ve gerçek kullanıcıların katıldığı binlerce saatlik bilimsel çalışmalarla geliştirilir.</p>
              
              <Link to="/" hash="teknoloji" className="mt-8 inline-flex"><Button type="button" variant="quiet" size="touch">Nasıl Hazırlandığını Gör <ArrowRight /></Button></Link>
            </div>
          </div>
        </section>

        <section className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-5 py-20 md:grid-cols-12 lg:px-8 lg:py-28">
            <div className="md:col-span-5">
              <p className="text-sm font-bold uppercase text-muted-foreground">Uzman uygulaması</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Sana özel, uzmanlar tarafından hazırlanır.</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">Uygun FootBalance tabanlığı; ayak yapın, basışın, günlük yaşamın ve hareket ihtiyacın birlikte değerlendirilerek seçilir ve kişiselleştirilir.</p>
            </div>
            <div className="md:col-span-7"><img src={productsImage} loading="lazy" width={544} height={408} alt="FootBalance Control ve Balance kişiye özel tabanlık modelleri" className="aspect-[4/3] w-full rounded-2xl object-cover" /></div>
            <div className="grid gap-4 md:col-span-12 md:grid-cols-4">
              {qualities.map(([title, text]) => <article key={title} className="rounded-xl border border-border bg-background p-6"><h3 className="text-base font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-2xl"><p className="text-sm font-bold uppercase text-muted-foreground">Uluslararası başarı</p><h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Ödüller ve kilometre taşları.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Yenilik, tasarım ve sürdürülebilir büyüme alanında Finlandiya’dan dünyaya uzanan başarı hikâyesi.</p></div>
            <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {awards.map(([year, title, text]) => <article key={`${year}-${title}`} className="rounded-lg border border-border bg-card p-4"><p className="text-[11px] font-bold text-muted-foreground">{year}</p><h3 className="mt-0.5 text-sm font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="bg-secondary">
          <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center lg:px-8 lg:py-20">
            <div><h2 className="text-3xl font-semibold sm:text-5xl">FootBalance deneyimini keşfet.</h2><p className="mt-4 max-w-2xl text-lg text-muted-foreground">Sana en yakın yetkili merkezde ayak ve basış analizini yaptır.</p></div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Link to="/merkezler"><Button type="button" variant="quiet" size="touch" className="w-full">Merkez Bul</Button></Link></div>
          </div>
        </section>
      </main>

      <footer className="bg-graphite text-primary-foreground">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-10 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between lg:px-8"><img src={logo} alt="FootBalance" className="h-8 w-auto brightness-0 invert" /><p>© 2026 FootBalance Türkiye</p></div>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-2 border-t border-border bg-background md:hidden"><Link to="/merkezler" className="flex h-full items-center justify-center gap-2 text-sm font-semibold"><MapPin className="size-4" /> Merkez Bul</Link><Link to="/" hash="top" className="h-full"><Button className="h-full w-full rounded-none">Randevu Al</Button></Link></div>
    </div>
  );
}