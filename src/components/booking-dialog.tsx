import { languagePath } from "@/lib/i18n/urls";
import { detectCenterCity, type LocationStatus } from "@/lib/center-location";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Search, Check, Info, MapPin, CalendarDays, Clock3 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CenterCard } from "@/components/center-card";
import { Button } from "@/components/ui/button";
import { CENTERS, CENTER_CITIES } from "@/data/centers";
import { requestSchema, todayInIstanbul } from "@/lib/requests/schema";
import { useTranslation } from "@/lib/i18n";
import logo from "@/assets/footbalance-logo.svg";

export function BookingDialog({
  open,
  onOpenChange,
  initialCenter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCenter?: string | undefined;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-[#062d3e]/45"
        className="h-[100dvh] w-full overflow-y-auto border-0 p-5 sm:w-[min(720px,90vw)] sm:max-w-[720px] sm:p-8 [&>button]:right-6 [&>button]:top-8 [&>button>svg]:size-5 motion-reduce:animate-none"
      >
        <BookingSteps key={`${open}-${initialCenter ?? ""}`} initialCenter={initialCenter} />
      </SheetContent>
    </Sheet>
  );
}
function BookingSteps({ initialCenter }: { initialCenter?: string | undefined }) {
  const { tx, language } = useTranslation();
  const [step, setStep] = useState(initialCenter ? 1 : 0);
  const [center, setCenter] = useState(initialCenter ?? "");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const manualCity = useRef(false);
  useEffect(() => {
    if (initialCenter) return;
    let active = true;
    detectCenterCity()
      .then((detectedCity) => {
        if (!active || manualCity.current) return;
        if (detectedCity) setCity(detectedCity);
        setLocationStatus(detectedCity ? "ready" : "no-center");
      })
      .catch(() => {
        if (active && !manualCity.current) setLocationStatus("unavailable");
      });
    return () => {
      active = false;
    };
  }, [initialCenter]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [offset, setOffset] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = center ? CENTERS[Number(center)] : undefined;
  const dates = Array.from({ length: 4 }, (_, i) => {
    const day = new Date(`${todayInIstanbul()}T12:00:00+03:00`);
    day.setUTCDate(day.getUTCDate() + offset + i + 1);
    return {
      value: day.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
        day: "numeric",
        month: "long",
        weekday: "long",
        timeZone: "Europe/Istanbul",
      }).format(day),
    };
  });
  const optionClass =
    "rounded-2xl border border-[#d1dfe5] bg-white p-4 text-left transition hover:border-[#062d3e] hover:bg-[#e2f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !selected) return;
    const result = requestSchema.safeParse({
      type: "appointment",
      language,
      name,
      phone,
      email,
      consent,
      city: selected.city,
      center,
      preferredDate: date,
      preferredTime: time,
    });
    if (!result.success) {
      setError(tx(result.error.issues[0]?.message));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.json();
      if (!response.ok || body.ok !== true) throw new Error();
      setStep(4);
      window.dispatchEvent(
        new CustomEvent("footbalance:analytics", {
          detail: { event: "appointment_requested", center, date, time },
        }),
      );
    } catch {
      setError(
        tx(
          "Talebiniz gönderilemedi. Bilgileriniz korunuyor; tekrar deneyebilir veya bize telefonla ulaşabilirsiniz.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="text-sm leading-5 text-[#062d3e]">
      <a
        href={languagePath("/", language)}
        aria-label={tx("FootBalance Türkiye ana sayfa")}
        className="mb-6 inline-block"
      >
        <img src={logo} alt="FootBalance" className="h-6 w-auto" />
      </a>
      <SheetTitle className={step === 0 ? "sr-only" : "mb-2 text-lg"}>
        {tx(
          [
            "Sana en yakın FootBalance merkezini bul.",
            "Tercih Edilen Tarih",
            "Tercih Edilen Saat",
            "İletişim Bilgileri",
            "Randevu talebiniz alındı.",
          ][step],
        )}
      </SheetTitle>
      <SheetDescription className="sr-only">
        {step > 0 && selected
          ? `${selected.name}${date ? ` · ${date}` : ""}${time ? ` · ${time}` : ""}`
          : tx("Merkez seçin")}
      </SheetDescription>
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
          {(date || time) && (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-[#b9e5dd] pt-3 text-sm font-semibold">
              {date && (
                <span className="flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
                  {new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Europe/Istanbul",
                  }).format(new Date(`${date}T12:00:00+03:00`))}
                </span>
              )}
              {time && (
                <span className="flex items-center gap-2">
                  <Clock3 aria-hidden="true" className="size-4 shrink-0" />
                  {time}
                </span>
              )}
            </div>
          )}
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
            <label className="flex flex-1 items-center gap-2 rounded-full border border-[#d1dfe5] px-4">
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
                manualCity.current = true;
                setCity(e.target.value);
              }}
              className="min-h-12 rounded-full border border-[#d1dfe5] bg-white px-4"
            >
              <option value="">{tx("Tüm Şehirler")}</option>
              {CENTER_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          {!manualCity.current && (
            <div
              role={locationStatus === "no-center" ? "alert" : "status"}
              className={
                locationStatus === "no-center"
                  ? "mb-4 flex items-start gap-3 rounded-xl border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 px-4 py-4 text-sm font-medium leading-6 text-amber-950 shadow-sm"
                  : "mb-4 text-xs text-muted-foreground"
              }
            >
              {locationStatus === "no-center" && (
                <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
              )}
              <span>
                {locationStatus === "loading" && tx("Konumunuz belirleniyor…")}
                {locationStatus === "ready" &&
                  tx("Konumunuza göre {city} merkezleri gösteriliyor.", { city: tx(city) })}
                {locationStatus === "unavailable" &&
                  tx("Konumunuza erişilemedi; şehir seçerek merkezleri görüntüleyebilirsiniz.")}
                {locationStatus === "no-center" &&
                  tx(
                    "Bulunduğunuz şehirde merkezimiz bulunmuyor; tüm merkezleri görüntüleyebilir veya şehir seçebilirsiniz.",
                  )}
              </span>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {CENTERS.map((c, i) => ({ c, i }))
              .filter(
                ({ c }) =>
                  (!city || c.city === city) &&
                  `${c.name} ${c.person} ${c.city} ${c.address}`
                    .toLocaleLowerCase("tr-TR")
                    .includes(query.toLocaleLowerCase("tr-TR")),
              )
              .sort((a, b) => Number(b.c.main) - Number(a.c.main))
              .map(({ c, i }) => (
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
            {!CENTERS.some(
              (c) =>
                (!city || c.city === city) &&
                `${c.name} ${c.person} ${c.city} ${c.address}`
                  .toLocaleLowerCase("tr-TR")
                  .includes(query.toLocaleLowerCase("tr-TR")),
            ) && <p role="status">{tx("Merkez bulunamadı.")}</p>}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dates.map((d) => (
              <button
                type="button"
                key={d.value}
                className={`${optionClass} min-h-20 text-center text-base font-semibold sm:min-h-24 ${date === d.value ? "border-[#062d3e] bg-[#e2f8f4]" : ""}`}
                onClick={() => {
                  setDate(d.value);
                  setTime("");
                  setStep(2);
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between gap-3">
            <Button variant="quiet" disabled={offset === 0} onClick={() => setOffset(offset - 4)}>
              {tx("Önceki Günler")}
            </Button>
            <Button variant="quiet" onClick={() => setOffset(offset + 4)}>
              {tx("Sonraki Günler")}
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            {tx(
              "Tercih ettiğiniz gün ve saati belirtebilirsiniz. Randevunuz merkez tarafından onaylandıktan sonra kesinleşir.",
            )}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"].map((t) => (
              <button
                type="button"
                key={t}
                className={`${optionClass} min-h-20 text-center text-lg font-semibold ${time === t ? "border-[#062d3e] bg-[#e2f8f4]" : ""}`}
                onClick={() => {
                  setTime(t);
                  setStep(3);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}
      {step === 3 && (
        <form onSubmit={submit} noValidate>
          <fieldset disabled={busy} className="space-y-4">
            {[
              {
                label: "Ad Soyad",
                value: name,
                change: setName,
                type: "text",
                autocomplete: "name",
                max: 100,
              },
              {
                label: "Telefon",
                value: phone,
                change: setPhone,
                type: "tel",
                autocomplete: "tel",
                max: 30,
              },
              {
                label: "E-posta",
                value: email,
                change: setEmail,
                type: "email",
                autocomplete: "email",
                max: 254,
              },
            ].map((f) => (
              <label key={f.label} className="block text-sm font-semibold">
                {tx(f.label)}{" "}
                {f.type === "email" && (
                  <span className="font-normal text-muted-foreground">{tx("(isteğe bağlı)")}</span>
                )}
                <input
                  type={f.type}
                  autoComplete={f.autocomplete}
                  maxLength={f.max}
                  required={f.type !== "email"}
                  value={f.value}
                  onChange={(e) => f.change(e.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#d1dfe5] px-4 outline-none focus:border-primary"
                />
              </label>
            ))}
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              {tx(
                "Talebim kapsamında benimle iletişime geçilmesine ve paylaştığım bilgilerin bu amaçla kullanılmasına onay veriyorum.",
              )}
            </label>
            <p className="text-sm text-muted-foreground">
              {tx(
                "Ekibimiz uygun gün ve saati sizinle birlikte kesinleştirmek için iletişime geçecek.",
              )}
            </p>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <Back onClick={() => setStep(2)} label={tx("Geri")} />
              <Button type="submit" variant="appointment" size="touch">
                {tx(busy ? "Gönderiliyor…" : "Randevuyu Oluştur")}
              </Button>
            </div>
          </fieldset>
        </form>
      )}
      {(step === 1 || step === 2) && (
        <div className="mt-6">
          <Back onClick={() => setStep(step - 1)} label={tx("Geri")} />
        </div>
      )}
      {step === 4 && (
        <div role="status" className="rounded-3xl bg-[#e2f8f4] p-8">
          <Check className="mb-5 size-10" />
          <p className="text-base">
            {tx(
              "Ekibimiz uygun gün ve saati sizinle birlikte kesinleştirmek için iletişime geçecek.",
            )}
          </p>
        </div>
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
