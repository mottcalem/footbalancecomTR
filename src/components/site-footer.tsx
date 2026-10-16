import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookingDialog } from "@/components/booking-dialog";
import { useTranslation } from "@/lib/i18n";
import { languagePath } from "@/lib/i18n/urls";
import logo from "@/assets/footbalance-logo.svg";

const groups = [
  [
    "FootBalance",
    [
      ["Hakkımızda", "/hakkimizda/"],
      ["Teknolojimiz", "/#teknoloji"],
      ["Kullanıcı Deneyimleri", "/kisiye-ozel-tabanlik-yorumlari/"],
      ["İletişim", "/iletisim/"],
    ],
  ],
  [
    "Kişiye Özel Tabanlık",
    [
      ["Ürünler", "/urunler/"],
      ["Nasıl Çalışır?", "/#surec"],
      ["Kimler İçin?", "/#kimler"],
    ],
  ],
  [
    "Ayak Sağlığı",
    [
      ["Blog", "/ayak-sagligi-hakkinda-bilgiler/"],
      ["Videolar", "/tabanlik-sekillendirme-videolari/"],
      ["Prof. Dr. Gül Baltacı Röportajı", "/prof-dr-gul-baltaci/"],
      ["Sık Sorulan Sorular", "/#sss"],
    ],
  ],
  [
    "Merkezler",
    [
      ["Merkez Bul", "/merkezler/"],
      ["Randevu Al", "booking"],
    ],
  ],
  [
    "Çözüm Ortağı Ol",
    [
      ["Online Mağaza", "https://shop.footbalance.com.tr/"],
      ["Instagram", "https://www.instagram.com/FootBalanceTR/"],
      ["YouTube", "https://www.youtube.com/channel/UCFnMmPY9CVrzRmI7v_8D2gg"],
    ],
  ],
] as const;

export function SiteFooter() {
  const { tx, language } = useTranslation();
  const [booking, setBooking] = useState(false);
  const href = (path: string) => {
    if (path.startsWith("https:")) return path;
    const [pathname = "/", hash] = path.split("#");
    if (pathname === "/urunler/") return language === "en" ? "/en/products/" : "/urunler/";
    const translated = [
      "/kisiye-ozel-tabanlik-yorumlari/",
      "/tabanlik-sekillendirme-videolari/",
    ].includes(pathname)
      ? pathname
      : languagePath(pathname, language);
    return translated + (hash ? `#${hash}` : "");
  };
  return (
    <>
      <footer className="bg-graphite text-primary-foreground">
        <div className="mx-auto max-w-[1360px] px-5 py-6 lg:px-8">
          <Link
            to="/"
            aria-label={tx("FootBalance Türkiye ana sayfa")}
            className="inline-block shrink-0"
          >
            <img src={logo} alt="FootBalance" className="h-9 w-auto brightness-0 invert" />
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-5 md:gap-5">
            {groups.map(([title, links]) => (
              <div key={title}>
                {title === "Çözüm Ortağı Ol" ? (
                  <Link
                    to="/cozum-ortagi-ol/"
                    className="text-sm font-bold uppercase hover:text-primary-foreground/80"
                  >
                    {tx(title)}
                  </Link>
                ) : title !== "FootBalance" ? (
                  <h2 className="text-sm font-bold uppercase">{tx(title)}</h2>
                ) : null}
                <ul className="mt-2 space-y-1 text-sm text-primary-foreground/65">
                  {links.map(([label, path]) => (
                    <li key={label}>
                      {path === "booking" ? (
                        <button
                          type="button"
                          onClick={() => setBooking(true)}
                          className="min-h-6 text-left hover:text-primary-foreground"
                        >
                          {tx(label)}
                        </button>
                      ) : (
                        <a
                          href={href(path)}
                          target={path.startsWith("https:") ? "_blank" : undefined}
                          rel={path.startsWith("https:") ? "noopener noreferrer" : undefined}
                          className="block min-h-6 text-left hover:text-primary-foreground"
                        >
                          {tx(label)}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col justify-between gap-4 border-t border-primary-foreground/15 pt-4 text-xs text-primary-foreground/55 sm:flex-row">
            <p>{tx("© 2026 FootBalance Türkiye")}</p>
            <div className="flex flex-wrap gap-5">
              {[
                ["Çerez Politikası ve Aydınlatma Metni", "/cerez-politikasi-ve-aydinlatma-metni/"],
                ["Kullanım Koşulları", "/kullanim-kosullari/"],
              ].map(([label, path]) => (
                <a key={label} href={path} className="hover:text-primary-foreground">
                  {tx(label)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <BookingDialog open={booking} onOpenChange={setBooking} />
    </>
  );
}
