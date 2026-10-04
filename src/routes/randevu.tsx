import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestForm } from "@/components/request-form";
import { translate, useTranslation, LanguageSwitcher } from "@/lib/i18n";
import { languagePath } from "@/lib/i18n/urls";
import logo from "@/assets/footbalance-logo.svg";

export const Route = createFileRoute("/randevu")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) => ({
    meta: [
      { title: translate("Randevu Talebi | FootBalance Türkiye", match.search.lang) },
      {
        name: "description",
        content: translate(
          "Size en yakın FootBalance merkezinde ayak analizi için randevu talebi oluşturun. Tercih ettiğiniz gün ve saati belirtin, ekibimiz sizi arasın.",
          match.search.lang,
        ),
      },
    ],
    links: [
      { rel: "canonical", href: languagePath("/randevu", match.search.lang ?? "tr") },
      { rel: "alternate", hrefLang: "tr", href: "/randevu" },
      { rel: "alternate", hrefLang: "en", href: "/en/randevu" },
    ],
  }),
  component: AppointmentPage,
});
function AppointmentPage() {
  const { tx } = useTranslation();
  const [menu, setMenu] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <Link className="py-3" to="/" onClick={() => setMenu(false)}>
              {tx("Ana Sayfa")}
            </Link>
            <Link className="py-3" to="/" hash="nedir" onClick={() => setMenu(false)}>
              {tx("Kişiye Özel Tabanlık")}
            </Link>
            <Link className="py-3" to="/" hash="teknoloji" onClick={() => setMenu(false)}>
              {tx("Nasıl Hazırlanır?")}
            </Link>
            <Link className="py-3" to="/merkezler" onClick={() => setMenu(false)}>
              {tx("Merkez Bul")}
            </Link>
            <Link className="py-3" to="/cozum-ortagi-ol" onClick={() => setMenu(false)}>
              {tx("Çözüm Ortağı Ol")}
            </Link>
          </nav>
        )}
      </header>

      <main className="bg-secondary/40">
        <div className="mx-auto grid max-w-[1180px] items-start gap-10 px-5 py-12 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-20">
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              {tx("Ücretsiz Ayak Analizi")}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              {tx("İlk adımı birlikte atalım.")}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {tx(
                "Sana en yakın merkezi seç, iletişim bilgilerini bırak. Ekibimiz randevunu planlamak için seni arasın.",
              )}
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              {["Ayak ve basış analizi", "Uzman değerlendirmesi", "Sana uygun tabanlık seçimi"].map(
                (label) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-secondary">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                    {tx(label)}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-9 rounded-2xl border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">
                {tx("Telefonla randevu almak istersen")}
              </p>
              <a
                href="tel:+902123258851"
                className="mt-2 inline-flex items-center gap-2 font-semibold"
              >
                <Phone className="size-4" aria-hidden="true" />
                +90 212 325 88 51
              </a>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <RequestForm type="appointment" />
          </div>
        </div>
      </main>
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-muted-foreground">
          <p>© 2026 FootBalance Türkiye</p>
          <Link to="/iletisim">{tx("İletişim")}</Link>
        </div>
      </footer>
    </div>
  );
}
