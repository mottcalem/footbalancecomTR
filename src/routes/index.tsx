import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronLeft, Footprints, MapPin, Menu, Navigation, Search, SlidersHorizontal, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroImage from "@/assets/footbalance-hero.jpg";
import supportImage from "@/assets/need-support.jpg";
import activeImage from "@/assets/need-active.jpg";
import sportImage from "@/assets/need-sport.jpg";
import insoleImage from "@/assets/insole-product.jpg";
import techImage from "@/assets/technology-scan.jpg";
import finalImage from "@/assets/final-movement.jpg";
import problemIceDisa from "@/assets/problems/1-ice-disa-basma.png";
import problemDuzTaban from "@/assets/problems/2-duz-taban-yuksek-kemer.png";
import problemPlantar from "@/assets/problems/3-plantar-fasiit.png";
import problemCocuk from "@/assets/problems/4-cocuk-basis.png";
import problemDizKalca from "@/assets/problems/5-diz-kalca-omurga.png";
import problemTaban from "@/assets/problems/6-taban-agrisi.png";
import farkImage from "@/assets/fark-basis.jpg";
import logo from "@/assets/footbalance-logo.svg";
import { CENTERS } from "@/data/centers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kişiye Özel Ortopedik Tabanlık | FootBalance Türkiye" },
      { name: "description", content: "FootBalance ile ayak ve basış yapınızı analiz ettirin, ihtiyacınıza uygun kişiye özel ortopedik tabanlığınızı keşfedin. Size en yakın FootBalance merkezinden randevu alın." },
      { property: "og:title", content: "Kişiye Özel Ortopedik Tabanlık | FootBalance Türkiye" },
      { property: "og:description", content: "Ayak ve basış analiziyle kişiye özel ortopedik tabanlığınızı keşfedin ve randevunuzu oluşturun." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

type EventName = "hero_booking_click" | "center_finder_open" | "center_search" | "center_selected" | "appointment_started" | "appointment_date_selected" | "appointment_time_selected" | "appointment_completed" | "how_it_works_click" | "existing_insole_cta_click" | "online_store_click" | "blog_post_click";
const track = (event: EventName, data: Record<string, string> = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("footbalance:analytics", { detail: { event, ...data } }));
};




const commonProblems = [
  [problemIceDisa, "İçe–Dışa Basma", "Ayakların yürürken içe veya dışa yöneliyorsa yük dağılımın dengesiz olabilir."],
  [problemDuzTaban, "Düz Taban & Yüksek Kemer", "Ayak kavisinin düşük ya da yüksek olması basışını ve gün içindeki konforunu etkileyebilir."],
  [problemPlantar, "Plantar Fasiit & Topuk Dikeni", "Sabah ilk adımlarda veya uzun süre ayakta kaldığında topuk ağrısı yaşıyor olabilirsin."],
  [problemCocuk, "Çocuklarda Basış Problemleri", "Sık düşme, ayakkabıların tek taraflı aşınması veya içe basma değerlendirme gerektirebilir."],
  [problemDizKalca, "Diz, Kalça & Omurga Ağrıları", "Ayaktaki dengesiz yük dağılımı, üst eklemlerde hissedilen rahatsızlıklarla ilişkili olabilir."],
  [problemTaban, "Ayak Tabanı Ağrısı & Yorgunluk", "Gün sonunda ayaklarında yanma, hassasiyet veya yoğun yorgunluk hissediyor olabilirsin."],
] as const;

function BrandButton({ children, onClick, className = "", variant = "appointment" }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: "appointment" | "soft" | "quiet" }) {
  return <Button type="button" variant={variant} size="touch" className={className} onClick={onClick}>{children}</Button>;
}

function Home() {
  const [booking, setBooking] = useState(false);
  const [menu, setMenu] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const openBlog = () => { setBlogOpen(true); track("blog_post_click", { action: "open" }); setTimeout(() => document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" }), 50); };
  const openBooking = (source: string) => { track(source === "hero" ? "hero_booking_click" : "appointment_started", { source }); setBooking(true); };
  const scrollTo = (id: string, event?: EventName) => { event && track(event); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-6 px-5 lg:px-8">
          <a href="#top" aria-label="FootBalance Türkiye ana sayfa" className="shrink-0"><img src={logo} alt="FootBalance" className="h-8 w-auto" /></a>
          <nav aria-label="Ana menü" className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex">
            <a href="#nedir">Kişiye Özel Tabanlık</a><a href="#teknoloji">Nasıl Hazırlanır?</a><a href="#kimler">Kimler İçin?</a><a href="#sss">Sık Sorulan Sorular</a>
          </nav>
          <Link to="/cozum-ortagi-ol" onClick={() => track("online_store_click")} className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex">Çözüm Ortağı Ol</Link>
          <BrandButton onClick={() => openBooking("header")} className="hidden sm:inline-flex">Randevu Al</BrandButton>
          <Button aria-label="Menüyü aç" variant="ghost" size="icon" className="ml-auto h-11 w-11 lg:hidden" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button>
        </div>
        {menu && <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden"><a className="py-3" href="#nedir" onClick={() => setMenu(false)}>Kişiye Özel Tabanlık</a><a className="py-3" href="#teknoloji" onClick={() => setMenu(false)}>Nasıl Hazırlanır?</a><a className="py-3" href="#kimler" onClick={() => setMenu(false)}>Kimler İçin?</a><a className="py-3" href="#sss" onClick={() => setMenu(false)}>Sık Sorulan Sorular</a><Link className="py-3" to="/cozum-ortagi-ol" onClick={() => setMenu(false)}>Çözüm Ortağı Ol</Link></nav>}
      </header>

      <main id="top">
        <section className="bg-muted">
          <div className="mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-12 md:grid-cols-12 md:py-20 lg:px-8">
            <div className="md:col-span-5">
              <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">Kişiye Özel Ortopedik Tabanlık</p>
              <h1 className="max-w-[12ch] text-[40px] font-semibold leading-[1.04] text-foreground sm:text-5xl lg:text-[68px]">Her Ayak Farklı.<br/>Tabanlığın da Öyle Olmalı.</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted-foreground">Ayak ve basış yapını analiz ediyor, günlük yaşamına, sporuna ve medikal ihtiyacına uygun ortopedik tabanlığını sana özel şekillendiriyoruz.</p>
              <p className="mt-5 text-sm font-semibold leading-6">Sadece 10 dakikada analiz <span className="text-mint-deep">•</span> Uzman değerlendirmesi <span className="text-mint-deep">•</span> Kişiye özel şekillendirme</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row"><BrandButton onClick={() => openBooking("hero")} className="sm:min-h-14">Ücretsiz Ayak Analizi İçin Randevu Al <ArrowRight /></BrandButton><BrandButton variant="quiet" onClick={() => scrollTo("teknoloji", "how_it_works_click")}>Nasıl Çalışıyor?</BrandButton></div>
              <p className="mt-3 text-sm text-muted-foreground">Sana en yakın FootBalance merkezinde.</p>
            </div>
            <div className="md:col-span-7"><img src={heroImage} width={1600} height={1104} alt="İstanbul sahilinde aktif şekilde yürüyen bir kadın" className="aspect-[16/11] w-full rounded-2xl object-cover" /></div>
          </div>
        </section>

        <section aria-label="FootBalance güvencesi" className="bg-muted"><div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-3 px-5 py-8 md:grid-cols-4 md:gap-4 lg:px-8">{["Finlandiya Teknolojisi","Kişiye Özel Şekillendirme","Uzman Uygulaması","Türkiye Genelinde Yetkili Merkezler"].map((x)=><div key={x} className="flex min-h-12 items-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold shadow-sm">{x}</div>)}</div></section>

        <section id="kimler" className="bg-background"><div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28"><h2 className="text-3xl font-semibold sm:text-5xl">Ayaklarından ne bekliyorsun?</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">İster günlük konfor, ister destek, ister performans. İhtiyacın farklı olabilir; ilk adım ayağını tanımak.</p><div className="mt-10 grid gap-5 md:grid-cols-3">
            {[[supportImage,"Sağlık & Destek","Medikal destek arıyorum.","Ayak, topuk, diz, bacak , bel veya sırt bölgesinde günlük yaşamı destekleyecek kişisel bir çözüm arıyorum."],[activeImage,"Konfor & Aktif Yaşam","Aktif kalmak istiyorum.","Gün boyu ayaktayım, çok yürüyorum veya günlük yaşamda daha fazla konfor istiyorum."],[sportImage,"Spor & Performans","Sporuma uygun destek istiyorum.","Koşu, tenis, padel, fitness, futbol, bisiklet veya diğer aktivitelerde performans arıyorum."]].map(([img,kicker,title,text])=><article key={title} className="group overflow-hidden rounded-2xl bg-muted"><img src={img} loading="lazy" width={1000} height={1250} alt={`${kicker} yaşam tarzı`} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"/><div className="p-6"><p className="text-xs font-bold uppercase text-muted-foreground">{kicker}</p><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div></article>)}</div><div className="mt-8 text-center"><BrandButton onClick={() => openBooking("relevance")}>Ayak Analiziyle Başla <ArrowRight /></BrandButton></div></div></section>

        <section aria-labelledby="common-problems-title" className="bg-secondary">
          <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Yaygın görülen ayak ve basış problemleri</p>
            <h2 id="common-problems-title" className="mt-3 max-w-[20ch] text-2xl font-semibold leading-tight sm:text-3xl">Bu belirtilerden biri sana tanıdık geliyor mu?</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Ayaklarındaki küçük bir farklılık; yürüyüşünü, gün içindeki konforunu ve hareket kaliteni etkileyebilir. Fark etmek, doğru desteğe giden ilk adımdır.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {commonProblems.map(([image, title, description]) => (
                <article key={title} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition duration-200 hover:border-[#BFDCD3] hover:shadow-sm">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#F7FAF9]">
                    <img src={image} alt={title} loading="lazy" width={128} height={128} className="size-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-tight">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-[11px] leading-5 text-muted-foreground">Bu belirtiler tek başına tanı anlamına gelmez. Ayak ve basış analizi, ihtiyacının uzman tarafından değerlendirilmesine yardımcı olur.</p>
          </div>
        </section>

          <section id="nedir" className="bg-muted"><div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center lg:px-8 lg:py-28"><div className="md:col-span-5"><p className="text-sm font-bold uppercase text-muted-foreground">Ortopedik tabanlık nedir?</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Ayağın ile ayakkabın arasındaki kişisel destek katmanı.</h2><p className="mt-6 text-lg leading-8 text-muted-foreground">Standart ayakkabılar milyonlarca farklı ayak için üretilir. 
Kişiye özel ortopedik tabanlık ise ayak ve basış yapına göre şekillendirilir. Basış dengesizliğini desteklemeye, ayağa binen yükü daha dengeli dağıtmaya ve hareket sırasında konforu artırmaya yardımcı olur.
</p></div><div className="md:col-span-7"><img src={insoleImage} loading="lazy" width={1200} height={1008} alt="Kişiye özel ortopedik tabanlık ürün detayı" className="w-full rounded-2xl"/></div><div className="grid gap-5 border-t border-border pt-8 md:col-span-12 md:grid-cols-3">{[["KİŞİYE ÖZEL","Sağ ve sol ayak ayrı ayrı değerlendirilir."],["DİNAMİK","Ayağın doğal hareketini desteklemek üzere tasarlanır."],["Çok Yönlü","Medikal destek, günlük yaşam ve farklı spor aktivitelerine kadar seçenekler bulunur."]].map(([a,b])=><div key={a} className="rounded-xl border border-border bg-background p-6 shadow-sm"><h3 className="text-sm font-bold uppercase">{a}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></div>)}</div></div></section>

        <section id="fark" aria-labelledby="fark-title" className="bg-background"><div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center lg:px-8 lg:py-28">
          <div className="md:col-span-7">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">FootBalance Farkı</p>
            <h2 id="fark-title" className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Her ortopedik tabanlık aynı değildir.</h2>
             <p className="mt-6 max-w-[640px] text-lg leading-8 text-muted-foreground">FootBalance, hazır bir tabanlığı ayağına yerleştirmekten fazlasını yapar. Önce ayağın ve basışın değerlendirilir, ardından tabanlık sağ ve sol ayağına , kullanım ihtiyacına göre kişiselleştirilir.</p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-muted md:hidden"><img src={farkImage} loading="lazy" width={1200} height={1408} alt="Ayak basışı ve kişiye özel FootBalance tabanlığı" className="aspect-[4/5] w-full object-cover"/></div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">{[[Search,"Önce Analiz","Tabanlık seçimi tahminle değil, ayak ve basış değerlendirmesiyle başlar."],[Footprints,"Sağ ve Sol Ayağa Özel","Her iki ayak ayrı değerlendirilir ve ayrı şekillendirilir."],[SlidersHorizontal,"İhtiyacına Göre","Günlük yaşam, medikal destek veya spor ihtiyacına göre uygun çözüm seçilir."],[UserCheck,"Uzman Eşliğinde","Analizden şekillendirmeye kadar süreç eğitimli uzman tarafından uygulanır."]].map(([Icon,t,d]: any)=>(
              <div key={t} className="flex gap-4 rounded-xl border border-border bg-muted/40 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/40 text-foreground"><Icon className="h-5 w-5" aria-hidden="true"/></span>
                <div><h3 className="text-sm font-bold uppercase tracking-wide">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></div>
              </div>))}</div>
            <p className="mt-10 text-xl font-semibold sm:text-2xl">Analiz et. Doğru tabanlığı seç. Sana özel şekillendir.</p>
            
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-muted md:col-span-5 md:block">
            <img src={farkImage} loading="lazy" width={1200} height={1408} alt="Ayak basışı ve kişiye özel FootBalance tabanlığı" className="aspect-[4/5] w-full object-cover md:aspect-[3/4]"/>
          </div>
        </div></section>

        

        <section id="surec" className="bg-secondary"><div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-8 md:grid-cols-2"><h2 className="text-3xl font-semibold sm:text-5xl">FootBalance Ortopedik Tabanlıkların<br/>faydaları neler?</h2><p className="self-end text-lg text-muted-foreground">Kişiye özel şekillendirilen FootBalance tabanlıkları günlük yaşamdan spora kadar ayağını destekler.</p></div><div className="mt-12 grid gap-4 md:grid-cols-4">{[["Sağlıklı Bas","Sağlıklı, doğru ve dengeli basmanıza yardımcı olur.."],["Hemen Hazır","Kullanmaya başlamak için beklemek gerekmez. 10 dk. 'da hazır."],["Tam Uyum","Her ayakkabı ile mükemmel uyum sağlar."],["Performans","Sporcunun performansını destekler, yaralanma riskini azaltır."]].map(([t,d],i)=><div key={t} className="rounded-xl bg-background p-6"><h3 className="text-lg font-semibold">{t}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{d}</p></div>)}</div><div className="mt-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><p className="text-2xl font-semibold">Dengeli basış. Hemen hazır. Her ayakkabıya uyumlu.</p><BrandButton onClick={() => openBooking("process")}>Ücretsiz Ayak Analizi İçin Randevu Al</BrandButton></div></div></section>

        

        <section id="teknoloji" className="overflow-hidden bg-[#F7FAF9] border-y border-[#DCF6F3] text-foreground"><div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:items-stretch lg:px-8 lg:py-28"><div className="md:col-span-5 flex flex-col"><p className="inline-flex items-center rounded-full bg-[#DCF6F3] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#00263E]">Finlandiya'da geliştirilen FootBalance teknolojisi</p><h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl text-[#00263E]">Doğru tabanlık,<br/>doğru analiz ile başlar.</h2><p className="mt-6 text-lg leading-8 text-[#00263E]/70">FootBalance sistemi, ayağını ve basışını değerlendirerek uzmanların uygun tabanlık seçimini ve kişiselleştirme sürecini destekler.</p><div className="mt-8 space-y-4">{[["AYAK & BASIŞ ANALİZİ","FootBalance teknolojisi ile önce analiz, ayağının yapısını tanı."],["KİŞİYE ÖZEL ŞEKİLLENDİRME","Tabanlığın sağ ve sol ayağına özel uzmanlar tarafından hazırlanır.."],["UZMAN UYGULAMASI","Teknoloji ve profesyonel değerlendirme ile uygulama."]].map(([a,b])=><div key={a} className="rounded-xl border border-[#DCF6F3] bg-background/60 px-5 py-4"><h3 className="text-base font-bold uppercase tracking-wide text-[#00263E]">{a}</h3><p className="mt-2 text-[15px] leading-6 text-[#00263E]/80">{b}</p></div>)}</div><BrandButton variant="soft" className="mt-8" onClick={() => openBooking("technology")}>Teknolojiyi Deneyimle — Randevu Al</BrandButton></div><div className="relative overflow-hidden rounded-2xl border border-[#DCF6F3] bg-background shadow-sm md:col-span-7"><img src={techImage} loading="lazy" width={1504} height={1008} alt="FootBalance ayak ve basış analizi uygulaması" className="h-full w-full object-cover"/><span aria-hidden="true" className="scan-line absolute inset-x-0 top-0 h-px bg-accent"/></div></div></section>


        <section id="deneyimler" className="bg-background"><div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28"><div className="flex items-end justify-between gap-4"><div><h2 className="text-3xl font-semibold sm:text-5xl">Hareket etmeye devam edenlerin deneyimleri.</h2><p className="mt-4 max-w-2xl text-lg text-muted-foreground">Günlük yaşamdan spora, FootBalance’ın farklı hareket ihtiyaçlarına eşlik ettiği alanları keşfet.</p></div><div className="hidden gap-2 sm:flex"><button type="button" aria-label="Geri" onClick={(e)=>{const s=e.currentTarget.closest('section')!.querySelector('[data-reviews-scroll]')!;s.scrollBy({left:-s.clientWidth*0.8,behavior:'smooth'})}} className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground hover:bg-muted">←</button><button type="button" aria-label="İleri" onClick={(e)=>{const s=e.currentTarget.closest('section')!.querySelector('[data-reviews-scroll]')!;s.scrollBy({left:s.clientWidth*0.8,behavior:'smooth'})}} className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground hover:bg-muted">→</button></div></div><div data-reviews-scroll className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">{[[activeImage,"Aktif yaşam / 50+"],[sportImage,"Koşu"],[supportImage,"Tenis, padel ve spor"]].map(([img,label])=><figure key={label} className="snap-start shrink-0 w-[220px] sm:w-[260px]"><img src={img} loading="lazy" width={1000} height={1250} alt={`${label} deneyim alanı`} className="aspect-[4/3] w-full rounded-xl object-cover"/><figcaption className="mt-3 text-base font-semibold">{label}</figcaption></figure>)}</div><p className="mt-7 text-sm text-muted-foreground">Doğrulanmış Türkiye kullanıcı hikâyeleri yayımlandıkça bu alanda paylaşılacaktır.</p></div></section>

        <section id="sss" className="bg-muted"><div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-12 md:grid-cols-12 lg:px-8 lg:py-16"><h2 className="text-2xl font-semibold sm:text-3xl md:col-span-5 md:pr-6">Randevu almadan önce bilmek isteyebileceklerin.</h2><div className="md:col-span-7"><Accordion type="single" collapsible>{[["Ne kadar sürüyor?","Ayak analizi ve sana özel tabanlığın hazırlanması yaklaşık 10 dakika içinde gerçekleştirilebilir."],["Tabanlığı hemen kullanabilir miyim?","Uygun tabanlık belirlendiğinde kişiye özel şekillendirme aynı ziyaret içerisinde yapılabilir."],["Spor yapmıyorsam kullanabilir miyim?","FootBalance günlük yaşam, spor ve farklı destek ihtiyaçlarına yönelik tabanlık seçenekleri sunar."],["Daha önce ortopedik tabanlık kullandıysam?","Mevcut deneyimin, ayak yapın ve kullanım ihtiyaçların uzman tarafından yeniden değerlendirilebilir."],["Ayak analizi nasıl yapılıyor?","FootBalance sistemi ile ayak ve basış yapın değerlendirilir; bilgiler uzman değerlendirmesiyle birlikte ele alınır."]].map(([q,a],i)=><AccordionItem key={q} value={`q${i}`}><AccordionTrigger className="py-4 text-sm sm:text-base">{q}</AccordionTrigger><AccordionContent className="pb-4 text-sm leading-6 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion><BrandButton className="mt-6" onClick={() => openBooking("faq")}>Ücretsiz Ayak Analizi İçin Randevu Al</BrandButton></div></div></section>


        <section className="bg-secondary"><div className="mx-auto flex max-w-[1360px] flex-col items-center gap-6 px-5 py-16 text-center lg:px-8 lg:py-20"><h2 className="text-3xl font-semibold sm:text-5xl">Sana en yakın FootBalance merkezini bul.</h2><p className="max-w-2xl text-lg text-muted-foreground">Türkiye genelindeki yetkili merkezler arasında sana en yakın olanı seç ve ayak analizi randevunu oluştur.</p><Link to="/merkezler" onClick={() => track("center_finder_open")}><BrandButton>Hizmet Merkezlerimiz
</BrandButton></Link></div></section>
        {blogOpen && <BlogGuide />}
      </main>


      <Footer onBooking={() => openBooking("footer")} onOpenBlog={openBlog} />
      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-2 border-t border-border bg-background md:hidden"><Link to="/merkezler" onClick={() => track("center_finder_open")} className="flex h-full items-center justify-center gap-2 text-sm font-semibold"><MapPin className="size-4"/> Merkez Bul</Link><Button className="h-full rounded-none" onClick={() => openBooking("mobile-bar")}><CalendarDays/> Randevu Al</Button></div>
      {booking && <BookingPanel onClose={() => setBooking(false)} />}
    </div>
  );
}


function BookingPanel({ onClose }: { onClose: () => void }) {
  const [step,setStep]=useState(1); const [center,setCenter]=useState(""); const [day,setDay]=useState(""); const [time,setTime]=useState(""); const [done,setDone]=useState(false); const [cityFilter,setCityFilter]=useState(""); const [districtQuery,setDistrictQuery]=useState("");
  const cities=[...new Set(CENTERS.map(c=>c.city).filter(c=>c!=="Diğer"))].sort((a,b)=>a.localeCompare(b,"tr"));
  const norm=(s:string)=>s.toLocaleLowerCase("tr-TR");
  const filteredCenters=CENTERS.filter(c=>(!cityFilter||c.city===cityFilter)&&(!districtQuery.trim()||norm(`${c.name} ${c.address}`).includes(norm(districtQuery.trim()))));
  const next=()=>setStep(s=>Math.min(4,s+1));
  return <div className="fixed inset-0 z-50 bg-foreground/45" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><aside role="dialog" aria-modal="true" aria-labelledby="booking-title" className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-background p-5 shadow-2xl sm:p-8"><div className="flex items-center justify-between"><img src={logo} alt="FootBalance" className="h-7 w-auto"/><Button aria-label="Randevu panelini kapat" variant="ghost" size="icon" className="h-11 w-11" onClick={onClose}><X/></Button></div>{done?<div className="py-12"><span className="grid size-14 place-items-center rounded-full bg-secondary"><Check/></span><h2 id="booking-title" className="mt-6 text-3xl font-semibold">Randevun oluşturuldu.</h2><dl className="mt-8 grid gap-3 rounded-xl bg-muted p-5 text-sm"><div><dt className="text-muted-foreground">Merkez</dt><dd className="font-semibold">{center}</dd></div><div><dt className="text-muted-foreground">Tarih ve saat</dt><dd className="font-semibold">{day}, {time}</dd></div><div><dt className="text-muted-foreground">Adres</dt><dd className="font-semibold">{CENTERS.find(c=>c.name===center)?.address ?? "Teşvikiye Cd. 42, Şişli"}</dd></div></dl><div className="mt-5 flex gap-3"><BrandButton><Navigation/> Yol Tarifi</BrandButton><BrandButton variant="quiet"><CalendarDays/> Takvimime Ekle</BrandButton></div><h3 className="mt-10 text-xl font-semibold">Randevunda seni ne bekliyor?</h3><ol className="mt-5 space-y-3 text-muted-foreground"><li>1. Ayak ve basış analizi</li><li>2. Uzman değerlendirmesi</li><li>3. Sana uygun tabanlık seçimi</li><li>4. Uygun durumda kişiye özel şekillendirme</li></ol></div>:<><div className="mt-4">
  {step===1&&<div className="space-y-4"><div className="rounded-2xl bg-secondary px-6 py-8 text-center sm:px-10"><h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Sana en yakın FootBalance merkezini bul.</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Türkiye genelinde +100 yetkili merkez. Ayak analizi randevunu oluşturturmak için ara.</p></div><div className="flex flex-col gap-3 md:flex-row md:items-center"><label className="relative w-full md:max-w-md"><span className="sr-only">Merkez ara</span><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><input type="search" value={districtQuery} onChange={e=>setDistrictQuery(e.target.value)} placeholder="Şehir, semt veya merkez ara..." className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"/></label><label className="w-full md:w-64"><span className="sr-only">Şehir seç</span><select value={cityFilter} onChange={e=>{setCityFilter(e.target.value);track("center_search",{city:e.target.value})}} className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Tüm Şehirler</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select></label></div>{(cityFilter||districtQuery.trim())&&(filteredCenters.length===0?<p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">Seçtiğin kriterlere uygun merkez bulunamadı.</p>:filteredCenters.map((c,i)=><button type="button" key={`${c.name}-${c.city}-${i}`} onClick={()=>{setCenter(c.name);track("center_selected",{center:c.name});next()}} className={`min-h-20 w-full rounded-xl border p-4 text-left ${center===c.name?"border-primary bg-secondary":"border-border"}`}><span className="font-semibold">{c.name}</span><span className="mt-1 block text-sm text-muted-foreground">{c.city} · {c.address}</span>{c.phone&&<span className="mt-0.5 block text-sm text-muted-foreground">{c.phone}</span>}</button>))}</div>}
  {step===2&&<div className="grid grid-cols-2 gap-3">{["7 Eylül Pazartesi","8 Eylül Salı","9 Eylül Çarşamba","10 Eylül Perşembe"].map(d=><button type="button" key={d} onClick={()=>{setDay(d);track("appointment_date_selected",{date:d});next()}} className={`min-h-20 rounded-xl border p-3 font-semibold ${day===d?"border-primary bg-secondary":"border-border"}`}>{d}</button>)}</div>}
  {step===3&&<div className="grid grid-cols-3 gap-3">{["10:00","11:30","13:00","14:30","16:00","17:30"].map(t=><button type="button" key={t} onClick={()=>{setTime(t);track("appointment_time_selected",{time:t});next()}} className={`min-h-14 rounded-xl border font-semibold ${time===t?"border-primary bg-secondary":"border-border"}`}>{t}</button>)}</div>}
  {step===4&&<form id="booking-form" className="space-y-4" onSubmit={e=>{e.preventDefault();track("appointment_completed");setDone(true)}}><label className="block text-sm font-semibold">Ad Soyad<input required className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal"/></label><label className="block text-sm font-semibold">Telefon<input required type="tel" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal"/></label><label className="block text-sm font-semibold">E-posta <span className="font-normal text-muted-foreground">(isteğe bağlı)</span><input type="email" className="mt-2 h-12 w-full rounded-lg border border-input px-4 font-normal"/></label><label className="flex gap-3 text-sm leading-6"><input required type="checkbox" className="mt-1 size-5"/> KVKK aydınlatma metnini okudum ve randevu iletişimine onay veriyorum.</label></form>}
</div><div className="mt-8 flex items-center justify-between gap-3">{step>1?<BrandButton variant="quiet" onClick={()=>setStep(s=>s-1)}><ChevronLeft/> Geri</BrandButton>:<span/>}{step===4&&<Button form="booking-form" type="submit" variant="appointment" size="wide" className="ml-auto">Randevuyu Oluştur</Button>}</div></>}</aside></div>
}

function Footer({ onBooking, onOpenBlog }: { onBooking: () => void; onOpenBlog: () => void }) {
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const external: Record<string, string> = { "Instagram": "https://www.instagram.com/footbalance/", "YouTube": "https://www.youtube.com/@FootBalance" };
  const onClick = (x: string) => {
    if (x === "Randevu Al") return onBooking;
    if (x === "Ayak Sağlığı Rehberi") return onOpenBlog;
    if (x === "Merkez Bul") return () => scroll("top");
    if (x === "Teknolojimiz") return () => scroll("teknoloji");
    if (x === "Kullanıcı Deneyimleri") return () => scroll("deneyimler");
    if (x === "Nasıl Çalışır?") return () => scroll("teknoloji");
    if (x === "Kimler İçin?") return () => scroll("kimler");
    if (x === "Sık Sorulan Sorular") return () => scroll("sss");
    return undefined;
  };
  const groups = {"FootBalance":["Hakkımızda","Teknolojimiz","Kullanıcı Deneyimleri","İletişim"],"Kişiye Özel Tabanlık":["Nasıl Çalışır?","Kimler İçin?"],"Ayak Sağlığı":["Ayak Sağlığı Rehberi","Sık Sorulan Sorular"],"Merkezler":["Merkez Bul","Randevu Al"],"Online":["Online Mağaza","Instagram","YouTube"]};
  return <footer className="bg-graphite text-primary-foreground"><div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-8"><div className="flex items-center gap-4"><img src={logo} alt="FootBalance" className="h-9 w-auto brightness-0 invert"/></div><div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-5 md:gap-5">{Object.entries(groups).map(([g,links])=><div key={g}>{g==="Online"?<Link to="/cozum-ortagi-ol" onClick={() => track("online_store_click")} className="text-sm font-bold uppercase text-primary-foreground hover:text-primary-foreground/80">Çözüm Ortağı Ol</Link>:<h2 className="text-sm font-bold uppercase">{g}</h2>}<ul className="mt-4 space-y-3 text-sm text-primary-foreground/65">{links.map(x=>{
    const handler = onClick(x);
    if (x === "Hakkımızda") return <li key={x}><Link to="/hakkimizda" className="min-h-6 block text-left hover:text-primary-foreground">{x}</Link></li>;
    if (x === "İletişim") return <li key={x}><Link to="/iletisim" className="min-h-6 block text-left hover:text-primary-foreground">{x}</Link></li>;
    if (x === "Online Mağaza") return <li key={x}><Link to="/cozum-ortagi-ol" onClick={() => track("online_store_click")} className="min-h-6 block text-left hover:text-primary-foreground">{x}</Link></li>;
    if (x === "Merkez Bul") return <li key={x}><Link to="/merkezler" onClick={() => track("center_finder_open")} className="min-h-6 block text-left hover:text-primary-foreground">{x}</Link></li>;
    if (external[x]) return <li key={x}><a href={external[x]} target="_blank" rel="noopener noreferrer" className="min-h-6 block text-left hover:text-primary-foreground">{x}</a></li>;
    return <li key={x}><button type="button" onClick={handler} className="min-h-6 text-left hover:text-primary-foreground">{x}</button></li>;
  })}</ul></div>)}</div><div className="mt-14 flex flex-col justify-between gap-5 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/55 sm:flex-row"><p>© 2026 FootBalance Türkiye</p><div className="flex gap-5"><span>KVKK</span><span>Çerez Politikası</span><span>Kullanım Koşulları</span></div></div></div></footer>;
}

const BLOG_POSTS = [
  { title: "X Bacak Neden Olur? Nedenleri ve Ayak Tabanı Bağı", tag: "Ayak & Bacak Yapısı", excerpt: "X bacak neden olur, hangi yaşta normal, ne zaman dikkat gerekir? Nedenleri, O bacak farkı ve ayak tabanı–basış ilişkisi.", url: "https://footbalance.com.tr/uncategorized-tr/x-bacak-neden-olur-nedenleri-ve-ayak-tabani-bagi/" },
  { title: "Ayak Mantarı ve Ayakkabı Hijyeni: Korunma Rehberi", tag: "Ayak Sağlığı", excerpt: "Ayakkabı rotasyonu, kurutma, çorap seçimi, tabanlık temizliği ve hekime başvurma zamanı için pratik rehber.", url: "https://footbalance.com.tr/uncategorized-tr/ayak-mantari-ayakkabi-hijyeni/" },
  { title: "Bisiklet Tabanlığı: Pedal Verimi ve Ayak Konumu", tag: "Spor & Performans", excerpt: "Bisiklet tabanlığı pedal verimini ve ayak konumunu nasıl etkiler? Kalınlık, cleat ayarı ve uyum takvimi.", url: "https://footbalance.com.tr/uncategorized-tr/bisiklet-tabanligi-pedal-verimi/" },
  { title: "Ayak Tabanında Nasır ve Su Toplaması", tag: "Ayak Sağlığı", excerpt: "Nasır ve su toplaması neden oluşur, sürtünme nasıl azaltılır? Kişiye özel tabanlığın ayak konforuna katkısı.", url: "https://footbalance.com.tr/uncategorized-tr/ayak-tabaninda-nasir-ve-su-toplamasi-footbalance/" },
  { title: "Diz Ağrısı İçin Dizlik mi Tabanlık mı?", tag: "Ağrı & Destek", excerpt: "Cevap ayak-diz zincirinde gizli. Hangisi ne işe yarar, hangi durumda neyi seçmeli?", url: "https://footbalance.com.tr/uncategorized-tr/diz-agrisi-icin-dizlik-mi-tabanlik-mi/" },
  { title: "Ayakkabı Numarası Nasıl Ölçülür? Kalıp ve Genişlik Rehberi", tag: "Ayakkabı Seçimi", excerpt: "Evde kâğıtla ayak uzunluğu ölçümü, santimetre-EU dönüşüm tablosu, kalıp farkı ve genişlik sınıfları.", url: "https://footbalance.com.tr/uncategorized-tr/ayakkabi-numarasi-nasil-olculur/" },
];

function BlogGuide() {
  const [q, setQ] = useState("");
  const norm = (s: string) => s.toLocaleLowerCase("tr-TR");
  const list = BLOG_POSTS.filter((p) => [p.title, p.excerpt, p.tag].some((t) => norm(t).includes(norm(q.trim()))));
  return (
    <section id="blog" className="bg-background">
      <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Ayak Sağlığı Rehberi</h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">Ayak sağlığı, tabanlık kullanımı ve spor performansı hakkında güncel yazılar.</p>
          </div>
          <label className="w-full md:w-80">
            <span className="sr-only">Yazılarda ara</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Konu ara: diz ağrısı, bisiklet, nasır..."
              className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" onClick={() => track("blog_post_click")} className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/25 hover:shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{p.tag}</span>
              <h3 className="mt-3 text-lg font-semibold leading-6">{p.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{p.excerpt}</p>
              <span className="mt-4 text-sm font-semibold">Yazıyı oku →</span>
            </a>
          ))}
        </div>
        {list.length === 0 && <p className="mt-8 text-sm text-muted-foreground">Aramanla eşleşen yazı bulunamadı.</p>}
      </div>
    </section>
  );
}
