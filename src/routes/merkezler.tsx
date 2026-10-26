import { existingPageHead } from "@/lib/seo";
import { translate, useTranslation, LanguageSwitcher } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CenterCard } from "@/components/center-card";
import { BookingDialog } from "@/components/booking-dialog";
import logo from "@/assets/footbalance-logo.svg";
import { useCenters } from "@/lib/centers/context";

export const Route = createFileRoute("/merkezler")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) =>
    existingPageHead(
      "/merkezler",
      match.search.lang,
      translate("FootBalance Hizmet Noktaları | Yetkili Merkezler", match.search.lang),
      translate(
        "Türkiye ve yurt dışındaki FootBalance yetkili hizmet noktalarını şehre göre filtreleyin; adres, telefon ve yol tarifi bilgilerine ulaşıp ayak analizi randevunuzu oluşturun.",
        match.search.lang,
      ),
    ),
  component: CentersPage,
});

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

function CentersPage() {
  const { centers: CENTERS, cities: CENTER_CITIES } = useCenters();
  const [bookingCenter, setBookingCenter] = useState<string | undefined>();
  const { tx } = useTranslation();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("Tüm Şehirler");
  const hasSearch = q.trim().length > 0 || city !== "Tüm Şehirler";

  const list = (() => {
    if (!hasSearch) return [];
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
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-2 px-4 sm:gap-6 sm:px-5 lg:px-8">
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
            to="/cozum-ortagi-ol/"
            className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex"
          >
            {tx("Çözüm Ortağı Ol")}
          </Link>
          <Link to="/randevu/" className="hidden sm:inline-flex">
            <Button type="button" variant="appointment" size="touch">
              {tx("Randevu Al")}
            </Button>
          </Link>
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
            <Link className="py-3" to="/cozum-ortagi-ol/" onClick={() => setMenu(false)}>
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
              {tx("Merkezleri görüntülemek için arama yapın veya şehir seçin.")}
            </p>
          </div>
        </section>

        <section aria-label={tx("Yetkili hizmet noktaları")} className="bg-background">
          <div className="mx-auto max-w-[1360px] px-5 py-12 lg:px-8 lg:py-16">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((c) => (
                <CenterCard
                  key={`${c.name}-${c.address}`}
                  c={c}
                  onBooking={() => setBookingCenter(c.id)}
                />
              ))}
            </div>
            {hasSearch && list.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {tx(
                  "Aramanla eşleşen merkez bulunamadı. Farklı bir şehir ya da anahtar kelime deneyebilirsin.",
                )}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
