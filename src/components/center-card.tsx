import { Mail, MapPin, Navigation, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import type { Center } from "@/data/centers";
import centerLogo from "@/assets/center-logo.svg";
import centerLogoMain from "@/assets/center-logo-main.svg";

export function CenterCard({
  c,
  onBooking,
  compact = false,
}: {
  c: Center;
  onBooking: () => void;
  compact?: boolean;
}) {
  const { tx } = useTranslation();
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-card p-5 transition hover:border-foreground/25 hover:shadow-sm ${c.main ? "border-primary/50 ring-1 ring-primary/15" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={c.main ? centerLogoMain : centerLogo}
            alt=""
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-lg"
          />
          <h3 className="text-sm font-bold leading-5 text-foreground">{c.name}</h3>
        </div>
        {c.main && (
          <span
            title={tx("Önerilen merkez")}
            aria-label={tx("Önerilen merkez")}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-lg font-bold text-foreground"
          >
            ★
          </span>
        )}
      </div>
      <div className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
        {c.person && (
          <p className="flex gap-2">
            <User className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" />{" "}
            <span>{c.person}</span>
          </p>
        )}
        {c.phone && (
          <p className="flex gap-2">
            <Phone className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" />{" "}
            <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="hover:text-foreground">
              {c.phone}
            </a>
          </p>
        )}
        {c.address && (
          <p className="flex gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" />{" "}
            <span>{c.address}</span>
          </p>
        )}
      </div>
      <div className={compact ? "mt-auto pt-4" : "contents"}>
        <Button
          type="button"
          variant={compact ? "outline" : "appointment"}
          className={
            compact
              ? "h-9 rounded-full border-primary/20 px-4 text-xs font-medium shadow-none hover:bg-secondary"
              : "mt-5"
          }
          onClick={onBooking}
        >
          {tx("Randevu Al")}
        </Button>
      </div>
      {!compact && (
        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-4">
          {c.email ? (
            <a
              href={`mailto:${c.email}`}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-graphite text-xs font-semibold text-primary-foreground transition hover:bg-graphite/90"
            >
              <Mail className="size-3.5" aria-hidden="true" /> {tx("E-Posta Gönder")}{" "}
            </a>
          ) : (
            <span aria-hidden="true" className="min-h-9" />
          )}
          {c.maps ? (
            <a
              href={c.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-graphite text-xs font-semibold text-primary-foreground transition hover:bg-graphite/90"
            >
              <Navigation className="size-3.5" aria-hidden="true" /> {tx("Yol Tarifi")}{" "}
            </a>
          ) : (
            <span aria-hidden="true" className="min-h-9" />
          )}
        </div>
      )}
    </article>
  );
}
