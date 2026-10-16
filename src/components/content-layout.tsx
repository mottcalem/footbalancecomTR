import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookingDialog } from "@/components/booking-dialog";
import { useTranslation, LanguageSwitcher } from "@/lib/i18n";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languagePath } from "@/lib/i18n/urls";
import logo from "@/assets/footbalance-logo.svg";

export function ContentLayout({ children }: { children: ReactNode }) {
  const { tx, language } = useTranslation();
  const [booking, setBooking] = useState(false);
  const [menu, setMenu] = useState(false);
  const sections = [
    ["Kimler İçin?", "kimler"],
    ["Kişiye Özel Tabanlık", "nedir"],
    ["Nasıl Hazırlanır?", "teknoloji"],
    ["Sık Sorulan Sorular", "sss"],
  ] as const;
  return (
    <div className="min-h-screen bg-background text-foreground">
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
            {sections.map(([label, id]) => (
              <a key={id} href={`${languagePath("/", language)}#${id}`}>
                {tx(label)}
              </a>
            ))}
          </nav>
          <Link
            to="/cozum-ortagi-ol/"
            className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex"
          >
            {tx("Çözüm Ortağı Ol")}
          </Link>
          <Button
            variant="appointment"
            size="touch"
            onClick={() => setBooking(true)}
            className="hidden sm:inline-flex"
          >
            {tx("Randevu Al")}
          </Button>
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
          <nav
            aria-label={tx("Ana menü")}
            className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden"
          >
            {sections.map(([label, id]) => (
              <a
                key={id}
                className="py-3"
                href={`${languagePath("/", language)}#${id}`}
                onClick={() => setMenu(false)}
              >
                {tx(label)}
              </a>
            ))}
            <Link className="py-3" to="/cozum-ortagi-ol/" onClick={() => setMenu(false)}>
              {tx("Çözüm Ortağı Ol")}
            </Link>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-16">{children}</main>

      <BookingDialog open={booking} onOpenChange={setBooking} />
    </div>
  );
}
