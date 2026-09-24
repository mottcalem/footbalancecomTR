import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Mail, MapPin, Menu, Navigation, Phone, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/footbalance-logo.svg";
import centerLogo from "@/assets/center-logo.svg";
import centerLogoMain from "@/assets/center-logo-main.svg";
import { CENTERS, CENTER_CITIES, type Center } from "@/data/centers";

export const Route = createFileRoute("/merkezler")({
  head: () => ({
    meta: [
      { title: "FootBalance Hizmet Noktaları | Yetkili Merkezler" },
      { name: "description", content: "Türkiye ve yurt dışındaki FootBalance yetkili hizmet noktalarını şehre göre filtreleyin; adres, telefon ve yol tarifi bilgilerine ulaşıp ayak analizi randevunuzu oluşturun." },
      { property: "og:title", content: "FootBalance Hizmet Noktaları | Yetkili Merkezler" },
      { property: "og:description", content: "Sana en yakın FootBalance merkezini şehre göre bul; adres, telefon ve yol tarifi tek ekranda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/merkezler" }],
  }),
  component: CentersPage,
});

const norm = (s: string) => s.toLocaleLowerCase("tr-TR");

type LocationStatus = "loading" | "ready" | "no-center" | "unavailable";

type ReverseGeocodeResult = {
  address?: {
    city?: string;
    town?: string;
    province?: string;
    state?: string;
  };
};

function matchingCenterCity(place: string | undefined, longitude: number) {
  if (!place) return undefined;

  const detected = norm(place);
  if (detected === "istanbul") {
    return longitude >= 29 ? "İstanbul (Anadolu)" : "İstanbul (Avrupa)";
  }
  if (detected === "kocaeli") return "İzmit";

  return CENTER_CITIES.find((centerCity) => norm(centerCity) === detected);
}

function CenterCard({ c }: { c: Center }) {
  return (
    <article className={`flex h-full flex-col rounded-2xl border bg-card p-5 transition hover:border-foreground/25 hover:shadow-sm ${c.main ? "border-primary/50 ring-1 ring-primary/15" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
        <img src={c.main ? centerLogoMain : centerLogo} alt="" aria-hidden="true" className="h-9 w-9 shrink-0 rounded-lg" />
        <h3 className="text-sm font-bold leading-5 text-foreground">{c.name}</h3>
        </div>
        {c.main && <span title="Önerilen merkez" aria-label="Önerilen merkez" className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-lg font-bold text-foreground">★</span>}
      </div>
      <div className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
        {c.person && <p className="flex gap-2"><User className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" /> <span>{c.person}</span></p>}
        {c.phone && <p className="flex gap-2"><Phone className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" /> <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="hover:text-foreground">{c.phone}</a></p>}
        {c.address && <p className="flex gap-2"><MapPin className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" /> <span>{c.address}</span></p>}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-4">
        {c.email ? (
          <a href={`mailto:${c.email}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-graphite text-xs font-semibold text-primary-foreground transition hover:bg-graphite/90">
            <Mail className="size-3.5" aria-hidden="true" /> E-Posta Gönder
          </a>
        ) : <span aria-hidden="true" className="min-h-9" />}
        {c.maps ? (
          <a href={c.maps} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-graphite text-xs font-semibold text-primary-foreground transition hover:bg-graphite/90">
            <Navigation className="size-3.5" aria-hidden="true" /> Yol Tarifi
          </a>
        ) : <span aria-hidden="true" className="min-h-9" />}
      </div>
    </article>
  );
}

function CentersPage() {
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Tüm Şehirler");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    const detectLocation = async (position: GeolocationPosition) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`,
        );
        if (!response.ok) throw new Error("Konum çözümlenemedi");

        const result = (await response.json()) as ReverseGeocodeResult;
        const place = result.address?.city ?? result.address?.town ?? result.address?.province ?? result.address?.state;
        const detectedCity = matchingCenterCity(place, longitude);

        if (detectedCity) {
          setCity(detectedCity);
          setLocationStatus("ready");
        } else {
          setLocationStatus("no-center");
        }
      } catch {
        setLocationStatus("unavailable");
      }
    };

    navigator.geolocation.getCurrentPosition(
      detectLocation,
      () => setLocationStatus("unavailable"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  const list = useMemo(() => {
    const term = norm(q.trim());
    return CENTERS.filter((c) => (city === "Tüm Şehirler" || c.city === city) && (!term || [c.name, c.person, c.address, c.city].some((t) => norm(t).includes(term)))).sort((a, b) => Number(b.main) - Number(a.main));
  }, [q, city]);

  const hasFilter = city !== "Tüm Şehirler" || q.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
            <Link className="py-3" to="/" hash="nedir" onClick={() => setMenu(false)}>Kişiye Özel Tabanlık</Link>
            <Link className="py-3" to="/" hash="teknoloji" onClick={() => setMenu(false)}>Nasıl Hazırlanır?</Link>
            <Link className="py-3" to="/" hash="kimler" onClick={() => setMenu(false)}>Kimler İçin?</Link>
            <Link className="py-3" to="/" hash="sss" onClick={() => setMenu(false)}>Sık Sorulan Sorular</Link>
            <Link className="py-3" to="/cozum-ortagi-ol" onClick={() => setMenu(false)}>Çözüm Ortağı Ol</Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <section className="bg-[#eaf5f2]">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">Hizmet Noktaları</p>
            <h1 className="max-w-[18ch] text-[34px] font-semibold leading-[1.08] sm:text-5xl">Sağlıklı basış için sana en yakın merkez.</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-7 text-muted-foreground">Türkiye genelinde ve yurt dışında +100 yetkili FootBalance hizmet noktası; ayak ve basış analizi, kişiye özel tabanlık uygulaması ve uzman değerlendirmesi sunuyor.</p>

            <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative w-full md:max-w-md">
                <span className="sr-only">Merkez ara</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Merkez, uzman veya semt ara..." className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <label className="w-full md:w-64">
                <span className="sr-only">Şehir seç</span>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setLocationStatus("unavailable");
                  }}
                  className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option>Tüm Şehirler</option>
                  {CENTER_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-3 text-xs text-muted-foreground" role="status">
              {locationStatus === "loading" && "Konumunuz belirleniyor…"}
              {locationStatus === "ready" && `Konumunuza göre ${city} merkezleri gösteriliyor.`}
              {locationStatus === "unavailable" && "Konumunuza erişilemedi; şehir seçerek merkezleri görüntüleyebilirsiniz."}
            </p>
            {locationStatus === "no-center" && (
              <div role="alert" className="mt-4 rounded-xl border border-primary/25 bg-background px-4 py-3 text-sm leading-6 text-foreground">
                <span className="font-semibold">Bulunduğunuz konumda henüz bir FootBalance merkezi görünmüyor.</span>{" "}
                Yukarıdaki şehir listesinden farklı bir lokasyon seçerek diğer merkezleri görüntüleyebilirsiniz.
              </div>
            )}
          </div>
        </section>

        <section aria-label="Yetkili hizmet noktaları" className="bg-background">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            {hasFilter ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((c) => <CenterCard key={`${c.name}-${c.address}`} c={c} />)}
                </div>
                {list.length === 0 && <p className="text-sm text-muted-foreground">Aramanla eşleşen merkez bulunamadı. Farklı bir şehir ya da anahtar kelime deneyebilirsin.</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Listelemek için bir şehir seç ya da merkez, semt, uzman adı ara.</p>
            )}
          </div>
        </section>


      </main>

      <footer className="bg-graphite text-primary-foreground">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-10 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <img src={logo} alt="FootBalance" className="h-8 w-auto brightness-0 invert" />
          <p>© 2026 FootBalance Türkiye</p>
        </div>
      </footer>
    </div>
  );
}
