import { centerPhones, centerPhoneHref } from "@/lib/centers/phones";
import { MapPin, Navigation, Phone, User, Mail, Globe } from "lucide-react";
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
  const numbers = centerPhones(c.phone);
  const phone = numbers[0] ? centerPhoneHref(numbers[0]) : "";
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
            <span className="flex flex-col">
              {numbers.map((number) => (
                <a key={number} href={centerPhoneHref(number)} className="hover:text-foreground">
                  {number}
                </a>
              ))}
            </span>
          </p>
        )}
        {c.email && (
          <p className="flex gap-2">
            <Mail className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" />
            <a href={`mailto:${c.email}`} className="break-all hover:text-foreground">
              {c.email}
            </a>
          </p>
        )}
        {c.site && (
          <p className="flex gap-2">
            <Globe className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden="true" />
            <a
              href={c.site}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all hover:text-foreground"
            >
              {c.site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
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
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {c.main ? (
          <Button
            type="button"
            variant={compact ? "outline" : "appointment"}
            className="min-h-10 flex-1 rounded-lg px-3 text-xs shadow-none"
            onClick={onBooking}
          >
            {tx("Randevu Al")}
          </Button>
        ) : (
          phone && (
            <Button
              asChild
              variant="appointment"
              className="min-h-10 flex-1 rounded-lg px-3 text-xs shadow-none"
            >
              <a href={phone} aria-label={`${tx("Bayiyi Ara")}: ${c.name}`}>
                <Phone className="size-3.5" aria-hidden="true" />
                {tx("Bayiyi Ara")}
              </a>
            </Button>
          )
        )}
        {(!compact || !c.main) && (
          <a
            href={
              c.maps ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <Navigation className="size-3.5" aria-hidden="true" />
            {tx("Yol Tarifi")}
          </a>
        )}
      </div>
    </article>
  );
}
