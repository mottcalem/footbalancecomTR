import { languagePath } from "@/lib/i18n/urls";
import { translate, useTranslation, LanguageSwitcher } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, MapPin, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CenterCard } from "@/components/center-card";
import { BookingDialog } from "@/components/booking-dialog";
import logo from "@/assets/footbalance-logo.svg";
import { CENTERS, CENTER_CITIES } from "@/data/centers";

export const Route = createFileRoute("/merkezler")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) => ({
    meta: [
      { title: translate("FootBalance Hizmet Noktaları | Yetkili Merkezler", match.search.lang) },
      {
        name: "description",
        content: translate(
          "Türkiye ve yurt dışındaki FootBalance yetkili hizmet noktalarını şehre göre filtreleyin; adres, telefon ve yol tarifi bilgilerine ulaşıp ayak analizi randevunuzu oluşturun.",
          match.search.lang,
        ),
      },
      {
        property: "og:title",
        content: translate("FootBalance Hizmet Noktaları | Yetkili Merkezler", match.search.lang),
      },
      {
        property: "og:description",
        content: translate(
          "Sana en yakın FootBalance merkezini şehre göre bul; adres, telefon ve yol tarifi tek ekranda.",
          match.search.lang,
        ),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: languagePath("/merkezler", match.search.lang ?? "tr") },
      { rel: "alternate", hrefLang: "tr", href: "/merkezler" },
      { rel: "alternate", hrefLang: "en", href: "/en/merkezler" },
    ],
  }),
  component: CentersPage,
});

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

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

function CentersPage() {
  const [bookingCenter, setBookingCenter] = useState<string | undefined>();
  const { tx } = useTranslation();
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
        const place =
          result.address?.city ??
          result.address?.town ??
          result.address?.province ??
          result.address?.state;
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

  const list = (() => {
    const term = norm(q.trim());
    return CENTERS.filter(
      (c) =>
        (city === "Tüm Şehirler" || c.city === city) &&
        (!term ||
          [c.name, c.person, c.address, c.city, tx(c.city)].some((t) => norm(t).includes(term))),
    ).sort((a, b) => Number(b.main) - Number(a.main));
  })();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <BookingDialog
        open={bookingCenter !== undefined}
        initialCenter={bookingCenter}
        onOpenChange={(open) => {
          if (!open) setBookingCenter(undefined);
        }}
      />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-6 px-5 lg:px-8">
          <Link to="/" aria-label={tx("FootBalance Türkiye ana sayfa")} className="shrink-0">
            <img src={logo} alt="FootBalance" className="h-8 w-auto" />
          </Link>
          <nav
            aria-label={tx("Ana menü")}
            className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex"
          >
            <Link to="/" hash="kimler">
              {tx("Kimler İçin?")}
            </Link>
            <Link to="/" hash="nedir">
              {tx("Kişiye Özel Tabanlık")}
            </Link>
            <Link to="/" hash="teknoloji">
              {tx("Nasıl Hazırlanır?")}
            </Link>
            <Link to="/" hash="sss">
              {tx("Sık Sorulan Sorular")}
            </Link>
          </nav>
          <Link
            to="/cozum-ortagi-ol"
            className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex"
          >
            {tx("Çözüm Ortağı Ol")}
          </Link>
          <Link to="/randevu" className="hidden sm:inline-flex">
            <Button type="button" variant="appointment" size="touch">
              {tx("Randevu Al")}
            </Button>
          </Link>
          <LanguageSwitcher />
          <Button
            aria-label={tx("Menüyü aç")}
            variant="ghost"
            size="icon"
            className="ml-auto h-11 w-11 lg:hidden"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </Button>
        </div>
        {menu && (
          <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden">
            <Link className="py-3" to="/" hash="kimler" onClick={() => setMenu(false)}>
              {tx("Kimler İçin?")}
            </Link>
            <Link className="py-3" to="/" hash="nedir" onClick={() => setMenu(false)}>
              {tx("Kişiye Özel Tabanlık")}
            </Link>
            <Link className="py-3" to="/" hash="teknoloji" onClick={() => setMenu(false)}>
              {tx("Nasıl Hazırlanır?")}
            </Link>
            <Link className="py-3" to="/" hash="sss" onClick={() => setMenu(false)}>
              {tx("Sık Sorulan Sorular")}
            </Link>
            <Link className="py-3" to="/cozum-ortagi-ol" onClick={() => setMenu(false)}>
              {tx("Çözüm Ortağı Ol")}
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <section className="bg-[#eaf5f2]">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">
              {tx("Hizmet Noktaları")}
            </p>
            <h1 className="max-w-[18ch] text-[34px] font-semibold leading-[1.08] sm:text-5xl">
              {tx("Sağlıklı basış için sana en yakın merkez.")}
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-7 text-muted-foreground">
              {tx(
                "Türkiye genelinde ve yurt dışında +100 yetkili FootBalance hizmet noktası; ayak ve basış analizi, kişiye özel tabanlık uygulaması ve uzman değerlendirmesi sunuyor.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative w-full md:max-w-md">
                <span className="sr-only">{tx("Merkez ara")}</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={tx("Merkez, uzman veya semt ara...")}
                  className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="w-full md:w-64">
                <span className="sr-only">{tx("Şehir seç")}</span>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setLocationStatus("unavailable");
                  }}
                  className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Tüm Şehirler">{tx("Tüm Şehirler")}</option>
                  {CENTER_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {tx(c)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 text-xs text-muted-foreground" role="status">
              {locationStatus === "loading" && tx("Konumunuz belirleniyor…")}
              {locationStatus === "ready" &&
                tx("Konumunuza göre {city} merkezleri gösteriliyor.", { city: tx(city) })}
              {locationStatus === "unavailable" &&
                tx("Konumunuza erişilemedi; şehir seçerek merkezleri görüntüleyebilirsiniz.")}
            </p>
            {locationStatus === "no-center" && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950 shadow-sm"
              >
                <Info className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <p className="font-bold">
                    {tx("Bulunduğunuz konumda henüz bir FootBalance merkezi görünmüyor.")}
                  </p>
                  <p className="mt-1">
                    {tx(
                      "Tüm merkezlerimizi aşağıda görüntüleyebilirsiniz. Yukarıdaki şehir listesinden farklı bir lokasyon seçerek merkezleri filtreleyebilirsiniz.",
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section aria-label={tx("Yetkili hizmet noktaları")} className="bg-background">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((c) => (
                <CenterCard
                  key={`${c.name}-${c.address}`}
                  c={c}
                  onBooking={() => setBookingCenter(String(CENTERS.indexOf(c)))}
                />
              ))}
            </div>
            {list.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {tx(
                  "Aramanla eşleşen merkez bulunamadı. Farklı bir şehir ya da anahtar kelime deneyebilirsin.",
                )}
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-graphite text-primary-foreground">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-10 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <img src={logo} alt="FootBalance" className="h-8 w-auto brightness-0 invert" />
          <p>{tx("© 2026 FootBalance Türkiye")}</p>
        </div>
      </footer>
    </div>
  );
}
