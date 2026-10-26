import { languagePath } from "@/lib/i18n/urls";
import { useState } from "react";
import { ChevronLeft, Search, MapPin, Navigation, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CenterCard } from "@/components/center-card";
import { Button } from "@/components/ui/button";
import { CENTERS, CENTER_CITIES } from "@/data/centers";
import { BeeasistBooking } from "@/components/beeasist-booking";
import { useTranslation } from "@/lib/i18n";
import logo from "@/assets/footbalance-logo.svg";

export function BookingDialog({
  open,
  onOpenChange,
  initialCenter,
  dealersOnly = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCenter?: string | undefined;
  dealersOnly?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-[#062d3e]/45"
        className="h-[100dvh] w-full overflow-y-auto border-0 p-5 sm:w-[min(720px,90vw)] sm:max-w-[720px] sm:p-8 [&>button]:right-6 [&>button]:top-8 [&>button>svg]:size-5 motion-reduce:animate-none"
      >
        <BookingSteps
          key={`${open}-${initialCenter ?? ""}`}
          initialCenter={initialCenter}
          dealersOnly={dealersOnly}
        />
      </SheetContent>
    </Sheet>
  );
}
export function BookingSteps({
  initialCenter,
  inline = false,
  dealersOnly = false,
}: {
  initialCenter?: string | undefined;
  inline?: boolean;
  dealersOnly?: boolean;
}) {
  const { tx, language } = useTranslation();
  const [step, setStep] = useState(initialCenter ? 1 : 0);
  const [center, setCenter] = useState(initialCenter ?? "");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const hasSearch = query.trim().length > 0 || city !== "";
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const term = normalize(query.trim());
  const centers = hasSearch
    ? CENTERS.map((c, i) => ({ c, i }))
        .filter(
          ({ c }) =>
            (!dealersOnly || !c.main) &&
            (!city || c.city === city) &&
            [c.name, c.person, c.city, tx(c.city), c.address].some((value) =>
              normalize(value).includes(term),
            ),
        )
        .sort((a, b) => Number(b.c.main) - Number(a.c.main))
    : [];

  const selected = center ? CENTERS[Number(center)] : undefined;
  const Title = inline ? "h2" : SheetTitle;
  const Description = inline ? "p" : SheetDescription;
  return (
    <div className="text-sm leading-5 text-[#062d3e]">
      <a
        href={languagePath("/", language)}
        aria-label={tx("FootBalance Türkiye ana sayfa")}
        className="mb-6 inline-block"
      >
        <img src={logo} alt="FootBalance" className="h-6 w-auto" />
      </a>
      <Title className={step === 0 ? "sr-only" : "mb-2 text-lg"}>
        {tx(step === 0 ? "Sana en yakın FootBalance merkezini bul." : "Randevu Al")}
      </Title>
      <Description className="sr-only">
        {step > 0 && selected ? selected.name : tx("Merkez seçin")}
      </Description>
      {step > 0 && selected && (
        <div className="mb-6 rounded-2xl border border-[#b9e5dd] border-l-4 border-l-primary bg-[#e2f8f4] p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#416571]">
            {tx("Seçtiğiniz Randevu Merkezi")}
          </p>
          <p className="text-lg font-bold leading-6 text-[#062d3e] sm:text-xl">{selected.name}</p>
          <div className="mt-3 flex items-start gap-2 text-sm leading-5 text-[#416571]">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{selected.address}</span>
          </div>
        </div>
      )}
      {step === 0 && (
        <>
          <div className="mb-5 rounded-2xl bg-[#e2f8f4] px-5 py-7 text-center">
            <h2 className="text-2xl font-semibold leading-tight sm:text-[28px]">
              {tx("Sana en yakın FootBalance merkezini bul.")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {tx(
                "Türkiye genelindeki yetkili merkezler arasında sana en yakın olanı seç ve ayak analizi randevunu oluştur.",
              )}
            </p>
          </div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#d1dfe5] px-4">
              <Search aria-hidden="true" className="size-4 shrink-0" />
              <input
                aria-label={tx("Merkez ara")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tx("Merkez, uzman veya semt ara...")}
                className="min-h-12 w-full min-w-0 bg-transparent outline-none"
              />
            </label>
            <select
              aria-label={tx("Şehir")}
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
              }}
              className="min-h-12 min-w-0 rounded-full border border-[#d1dfe5] bg-white px-4 sm:w-52"
            >
              <option value="">{tx("Tüm Şehirler")}</option>
              {CENTER_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <p role="status" className="mb-4 text-xs text-muted-foreground">
            {tx("Merkezleri görüntülemek için arama yapın veya şehir seçin.")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {centers.map(({ c, i }) => (
              <CenterCard
                compact
                key={i}
                c={c}
                onBooking={() => {
                  setCenter(String(i));
                  setStep(1);
                }}
              />
            ))}
            {hasSearch && centers.length === 0 && <p role="status">{tx("Merkez bulunamadı.")}</p>}
          </div>
        </>
      )}
      {step === 1 && selected && (
        <>
          {selected.main ? (
            <BeeasistBooking />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {selected.phone && (
                <Button asChild variant="appointment" size="touch">
                  <a href={`tel:${selected.phone.split(/\s+-\s+/)[0]?.replace(/[^\d+]/g, "")}`}>
                    <Phone aria-hidden="true" />
                    {tx("Bayiyi Ara")}
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" size="touch">
                <a
                  href={
                    selected.maps ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation aria-hidden="true" />
                  {tx("Yol Tarifi")}
                </a>
              </Button>
            </div>
          )}
          <div className="mt-6">
            <Back onClick={() => setStep(0)} label={tx("Geri")} />
          </div>
        </>
      )}
    </div>
  );
}
function Back({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="min-h-11 rounded-full px-5 text-sm"
    >
      <ChevronLeft />
      {label}
    </Button>
  );
}
