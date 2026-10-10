import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookingDialog } from "@/components/booking-dialog";
import { useTranslation, LanguageSwitcher } from "@/lib/i18n";
import logo from "@/assets/footbalance-logo.svg";

export function ContentLayout({ children }: { children: ReactNode }) {
  const { tx, language } = useTranslation();
  const [booking, setBooking] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link to="/">
            <img src={logo} alt="FootBalance" className="h-8 w-auto" />
          </Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm" aria-label={tx("Ana menü")}>
            <a
              href={
                language === "en" ? "/en/foot-health-blog/" : "/ayak-sagligi-hakkinda-bilgiler/"
              }
            >
              {tx("Blog")}
            </a>
            <Link to="/merkezler/">{tx("Merkez Bul")}</Link>
            <LanguageSwitcher />
            <button
              onClick={() => setBooking(true)}
              className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
            >
              {tx("Randevu Al")}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-16">{children}</main>
      <footer className="mt-12 border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
        <Link to="/">FootBalance Türkiye</Link> ·{" "}
        <Link to="/ayak-sagligi-hakkinda-bilgiler/">{tx("Blog")}</Link> ·{" "}
        <Link to="/iletisim/">{tx("Bize Ulaşın")}</Link> ·{" "}
        <a href="/gizlilik-politikasi/">{tx("Gizlilik Politikası")}</a>
      </footer>
      <BookingDialog open={booking} onOpenChange={setBooking} />
    </div>
  );
}
