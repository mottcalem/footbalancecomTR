import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CENTERS, CENTER_CITIES } from "@/data/centers";
import { useTranslation } from "@/lib/i18n";
import {
  PRACTICE_AREAS,
  requestSchema,
  todayInIstanbul,
  type RequestValues,
} from "@/lib/requests/schema";

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-base font-normal outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 aria-[invalid=true]:border-destructive";

export function RequestForm({ type }: { type: "appointment" | "partner" }) {
  const { tx, language } = useTranslation();
  const id = useId();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type,
      language,
      name: "",
      phone: "",
      email: "",
      city: "",
      center: "",
      company: "",
      field: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consent: false,
      website: "",
    },
    mode: "onBlur",
  });
  const city = watch("city");
  const centers = CENTERS.map((center, index) => ({ ...center, id: String(index) }))
    .filter((center) => center.city === city)
    .sort((a, b) => Number(b.main) - Number(a.main));
  const fieldProps = (name: keyof RequestValues) => ({
    id: `${id}-${name}`,
    "aria-required": [
      "name",
      "phone",
      "email",
      "city",
      "center",
      "company",
      "field",
      "consent",
    ].includes(name),
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });
  const error = (name: keyof RequestValues) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
        {tx(errors[name]?.message)}
      </p>
    ) : null;
  const submit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, language }),
        signal: AbortSignal.timeout(15000),
      });
      const result: { ok?: boolean } = await response.json();
      if (!response.ok || result.ok !== true) throw new Error("Request failed");
      setSent(true);
      window.dispatchEvent(
        new CustomEvent("footbalance:analytics", {
          detail: {
            event: type === "partner" ? "partner_application_submitted" : "appointment_requested",
          },
        }),
      );
    } catch {
      setSubmitError(
        "Talebiniz gönderilemedi. Bilgileriniz korunuyor; tekrar deneyebilir veya bize telefonla ulaşabilirsiniz.",
      );
    }
  });
  if (sent)
    return (
      <div role="status" className="rounded-2xl border border-border bg-background p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-secondary">
          <Check aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-2xl font-semibold">
          {tx(type === "partner" ? "Başvurunuz alındı." : "Randevu talebiniz alındı.")}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {tx(
            type === "partner"
              ? "FootBalance Türkiye ekibi en kısa sürede sizinle iletişime geçecek."
              : "Ekibimiz uygun gün ve saati sizinle birlikte kesinleştirmek için iletişime geçecek.",
          )}
        </p>
        <Button
          variant="quiet"
          className="mt-6"
          onClick={() => {
            reset();
            setSent(false);
          }}
        >
          {tx("Yeni Talep Oluştur")}
        </Button>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-8"
    >
      <div className="mb-6 border-b border-border pb-5">
        <h2 className="text-xl font-semibold">
          {tx(type === "appointment" ? "Randevu Talep Formu" : "Çözüm Ortaklığı Başvuru Formu")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {tx("Yıldızlı alanlar zorunludur.")}
        </p>
      </div>
      <fieldset disabled={isSubmitting} className="grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2">
        <label className="text-sm font-semibold" htmlFor={`${id}-name`}>
          {tx("Ad Soyad")} *
          <input
            {...register("name")}
            {...fieldProps("name")}
            autoComplete="name"
            maxLength={100}
            placeholder={tx("Adınız ve soyadınız")}
            className={inputClass}
          />
          {error("name")}
        </label>
        <label className="text-sm font-semibold" htmlFor={`${id}-phone`}>
          {tx("Telefon")} *
          <input
            {...register("phone")}
            {...fieldProps("phone")}
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder={tx("05xx xxx xx xx")}
            className={inputClass}
          />
          {error("phone")}
        </label>
        <label className="text-sm font-semibold sm:col-span-2" htmlFor={`${id}-email`}>
          {tx("E-posta")} *
          <input
            {...register("email")}
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="example@email.com"
            className={inputClass}
          />
          {error("email")}
        </label>
        {type === "appointment" ? (
          <>
            <label className="text-sm font-semibold" htmlFor={`${id}-city`}>
              {tx("Şehir")} *
              <select
                {...register("city", { onChange: () => setValue("center", "") })}
                {...fieldProps("city")}
                className={inputClass}
              >
                <option value="">{tx("Şehir seç")}</option>
                {CENTER_CITIES.filter((city) => city !== "Diğer").map((city) => (
                  <option key={city} value={city}>
                    {tx(city)}
                  </option>
                ))}
              </select>
              {error("city")}
            </label>
            <label className="text-sm font-semibold" htmlFor={`${id}-center`}>
              {tx("Merkez")} *
              <select
                {...register("center")}
                {...fieldProps("center")}
                disabled={!city || isSubmitting}
                className={`${inputClass} disabled:opacity-50`}
              >
                <option value="">{tx(city ? "Merkez seçin" : "Önce şehir seçin")}</option>
                {centers.map((center) => (
                  <option key={`${center.name}-${center.address}`} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
              {error("center")}
            </label>
            <p className="-mt-2 text-xs leading-5 text-muted-foreground sm:col-span-2">
              {tx(
                "Tercih ettiğiniz gün ve saati belirtebilirsiniz. Randevunuz merkez tarafından onaylandıktan sonra kesinleşir.",
              )}
            </p>
            <label className="text-sm font-semibold" htmlFor={`${id}-preferredDate`}>
              {tx("Tercih Edilen Tarih")}{" "}
              <span className="font-normal text-muted-foreground">{tx("(isteğe bağlı)")}</span>
              <input
                {...register("preferredDate")}
                {...fieldProps("preferredDate")}
                type="date"
                min={todayInIstanbul()}
                className={inputClass}
              />
              {error("preferredDate")}
            </label>
            <label className="text-sm font-semibold" htmlFor={`${id}-preferredTime`}>
              {tx("Tercih Edilen Saat")}{" "}
              <span className="font-normal text-muted-foreground">{tx("(isteğe bağlı)")}</span>
              <select
                {...register("preferredTime")}
                {...fieldProps("preferredTime")}
                className={inputClass}
              >
                <option value="">{tx("Seçiniz")}</option>
                <option value="morning">{tx("Sabah (09:00–12:00)")}</option>
                <option value="afternoon">{tx("Öğleden sonra (12:00–18:00)")}</option>
                <option value="any">{tx("Fark etmez")}</option>
              </select>
              {error("preferredTime")}
            </label>
          </>
        ) : (
          <>
            <label className="text-sm font-semibold sm:col-span-2" htmlFor={`${id}-company`}>
              {tx("Merkez / Firma Adı")} *
              <input
                {...register("company")}
                {...fieldProps("company")}
                autoComplete="organization"
                maxLength={150}
                className={inputClass}
              />
              {error("company")}
            </label>
            <label className="text-sm font-semibold" htmlFor={`${id}-city`}>
              {tx("Şehir")} *
              <input
                {...register("city")}
                {...fieldProps("city")}
                autoComplete="address-level2"
                maxLength={80}
                placeholder={tx("Şehrinizi yazın")}
                className={inputClass}
              />
              {error("city")}
            </label>
            <label className="text-sm font-semibold" htmlFor={`${id}-field`}>
              {tx("Faaliyet Alanı")} *
              <select {...register("field")} {...fieldProps("field")} className={inputClass}>
                <option value="">{tx("Seçiniz")}</option>
                {PRACTICE_AREAS.map((field) => (
                  <option key={field} value={field}>
                    {tx(field)}
                  </option>
                ))}
              </select>
              {error("field")}
            </label>
          </>
        )}
        <label className="text-sm font-semibold sm:col-span-2" htmlFor={`${id}-message`}>
          {tx("Mesajınız")}{" "}
          <span className="font-normal text-muted-foreground">{tx("(isteğe bağlı)")}</span>
          <textarea
            {...register("message")}
            {...fieldProps("message")}
            rows={3}
            maxLength={2000}
            placeholder={tx(
              type === "appointment"
                ? "Randevunuzla ilgili eklemek istedikleriniz"
                : "Merkeziniz ve çözüm ortaklığı beklentileriniz",
            )}
            className={inputClass}
          />
          {error("message")}
        </label>
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input {...register("website")} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm leading-6" htmlFor={`${id}-consent`}>
            <input
              {...register("consent")}
              {...fieldProps("consent")}
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-primary"
            />
            {tx(
              "Talebim kapsamında benimle iletişime geçilmesine ve paylaştığım bilgilerin bu amaçla kullanılmasına onay veriyorum.",
            )}
          </label>
          {error("consent")}
        </div>
        {submitError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 sm:col-span-2"
          >
            {tx(submitError)}{" "}
            <a href="tel:+902123258851" className="font-semibold underline">
              +90 212 325 88 51
            </a>
          </div>
        )}
        <Button
          type="submit"
          variant="appointment"
          size="touch"
          className="mt-1 w-full sm:col-span-2"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              {tx("Gönderiliyor…")}
            </>
          ) : (
            <>
              {tx(type === "appointment" ? "Randevu Talebi Gönder" : "Başvuruyu Gönder")}
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </fieldset>
    </form>
  );
}
