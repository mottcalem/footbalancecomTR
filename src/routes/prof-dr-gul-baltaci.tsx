import { useEffect, useId, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Check, LoaderCircle, Play } from "lucide-react";
import { ContentLayout } from "@/components/content-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { INTERVIEW_PROFESSIONS, requestSchema, type RequestValues } from "@/lib/requests/schema";
import { seoHead } from "@/lib/seo";
import { translate, useTranslation } from "@/lib/i18n";
import { languagePath } from "@/lib/i18n/urls";

export const FULL_INTERVIEW_URL = "https://www.youtube.com/watch?v=HmGfg22Gqrk";
const title = "Meslekte Fark Yaratan Fizyoterapistler: Prof. Dr. Gül Baltacı ile Kariyer ve Başarı";
export const Route = createFileRoute("/prof-dr-gul-baltaci")({
  head: ({ match }) =>
    seoHead({
      title: translate(`${title} | FootBalance`, match.search.lang),
      description: translate(
        "Prof. Dr. Gül Baltacı ile kariyer, klinik ve başarı üzerine bir sohbet. Kısa ön izlemeyi izleyin, formu doldurarak röportajın tamamına ulaşın.",
        match.search.lang,
      ),
      path: languagePath("/prof-dr-gul-baltaci/", match.search.lang === "en" ? "en" : "tr"),
      language: match.search.lang === "en" ? "en" : "tr",
      image: "/videos/gul-baltaci-cover.jpg",
    }),
  component: InterviewPage,
});

function InterviewPage() {
  const { tx } = useTranslation();
  const [open, setOpen] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const formTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    formTimer.current = setTimeout(() => {
      video.current?.pause();
      setOpen(true);
    }, 5000);
    return () => clearTimeout(formTimer.current);
  }, []);
  const openForm = () => {
    clearTimeout(formTimer.current);
    video.current?.pause();
    setOpen(true);
  };
  return (
    <ContentLayout>
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {tx("Kariyer · Klinik · Başarı")}
        </p>
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          {tx(title)}
        </h1>
        <div className="mt-8 overflow-hidden rounded-2xl bg-graphite">
          <video
            ref={video}
            controls
            preload="metadata"
            poster="/videos/gul-baltaci-cover.jpg"
            onEnded={openForm}
            className="aspect-video w-full"
            aria-label={tx("Prof. Dr. Gül Baltacı röportajı — kısa ön izleme")}
          >
            <source src="/videos/gul-baltaci-preview.mp4" type="video/mp4" />
            {tx("Tarayıcınız video oynatmayı desteklemiyor.")}
          </video>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary p-5 sm:p-6">
          <div>
            <p className="font-semibold">{tx("Bu sohbetin tamamını keşfedin.")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tx("Kısa formu doldurun, röportajın tamamını YouTube’da izleyin.")}
            </p>
          </div>
          <Button size="touch" onClick={openForm}>
            <Play className="size-4" aria-hidden="true" />
            {tx("Devamını İzle")}
          </Button>
        </div>
        <div className="mt-10 max-w-4xl space-y-5 text-base leading-7 text-muted-foreground sm:text-lg">
          <h2 className="text-2xl font-semibold text-foreground">
            {tx("Meslekte fark yaratan fizyoterapistler ne yapıyor?")}
          </h2>
          <p>
            {tx(
              "Türkiye’nin önde gelen spor fizyoterapisti Sayın Prof. Dr. Gül Baltacı, kendi mesleki yolculuğunu, kariyerinde dönüm noktası olan kararları ve bugün olsa yeniden mutlaka yapacağını düşündüğü adımları paylaşıyor.",
            )}
          </p>
          <p>{tx("Videoda şu sorulara yanıt bulacaksınız:")}</p>
          <ul className="space-y-3">
            {[
              "Başarılı fizyoterapistleri diğerlerinden ayıran özellikler nelerdir?",
              "Kendi kliniğini açmak isteyenler nelere dikkat etmeli?",
              "Meslekte fark yaratmak isteyen genç fizyoterapistler hangi alışkanlıkları edinmeli?",
              "“Keşke kariyerimin başında bilseydim” denilen önemli dersler nelerdir?",
            ].map((question) => (
              <li key={question} className="flex gap-3">
                <Check className="mt-1 size-5 shrink-0 text-foreground" aria-hidden="true" />
                <span>{tx(question)}</span>
              </li>
            ))}
          </ul>
          <p>
            {tx(
              "Mesleki gelişimine yatırım yapmak, danışanlarına daha fazla değer sunmak ve fizyoterapide fark yaratan bir bakış açısı kazanmak isteyen herkes için değerli bir sohbet.",
            )}
          </p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl p-6 sm:p-8">
          <DialogTitle className="pr-5 text-2xl leading-tight">
            {tx("Sadece Tedavi Etmek Yetmez: Fark Yaratan Yaklaşımı Keşfedin")}
          </DialogTitle>
          <DialogDescription>
            {tx(
              "Formu doldurduktan sonra röportajın tamamına otomatik olarak yönlendirileceksiniz.",
            )}
          </DialogDescription>
          <InterviewForm />
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
}

function InterviewForm() {
  const { tx, language } = useTranslation();
  const id = useId();
  const submission = useRef<{ id: string; payload: string } | undefined>(undefined);
  const [failure, setFailure] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: "interview",
      language,
      name: "",
      email: "",
      phone: "",
      profession: "",
      consent: false,
      website: "",
    },
  });
  const submit = handleSubmit(async (values) => {
    const payload = JSON.stringify({ ...values, language });
    if (submission.current?.payload !== payload)
      submission.current = { id: crypto.randomUUID(), payload };
    setFailure(false);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, language, submissionId: submission.current.id }),
        signal: AbortSignal.timeout(30000),
      });
      const result: { ok?: boolean } = await response.json();
      if (!response.ok || result.ok !== true) throw new Error("Submission failed");
      setSent(true);
      window.location.assign(FULL_INTERVIEW_URL);
    } catch {
      setFailure(true);
    }
  });
  const fields = [
    ["name", "Adınız Soyadınız", "text", "name"],
    ["profession", "Mesleğiniz", "select", "organization-title"],
    ["email", "E-posta", "email", "email"],
    ["phone", "Telefon", "tel", "tel"],
  ] as const;
  if (sent)
    return (
      <div role="status" className="space-y-4 py-4">
        <p>{tx("Bilgileriniz alındı. Videoya yönlendiriliyorsunuz.")}</p>
        <a
          href={FULL_INTERVIEW_URL}
          className="inline-flex items-center gap-2 font-semibold underline"
        >
          {tx("Videoyu aç")}
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate className="mt-2 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([field, label, type, autoComplete]) => (
          <div key={field}>
            <label htmlFor={`${id}-${field}`} className="text-sm font-medium">
              {tx(label)}
            </label>
            {type === "select" ? (
              <select
                id={`${id}-${field}`}
                {...register(field)}
                required
                aria-invalid={Boolean(errors[field])}
                aria-describedby={errors[field] ? `${id}-${field}-error` : undefined}
                className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-primary"
              >
                <option value="">{tx("Mesleğinizi seçin")}</option>
                {INTERVIEW_PROFESSIONS.map((p) => (
                  <option key={p} value={p}>
                    {tx(p)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`${id}-${field}`}
                {...register(field)}
                type={type}
                autoComplete={autoComplete}
                required
                aria-invalid={Boolean(errors[field])}
                aria-describedby={errors[field] ? `${id}-${field}-error` : undefined}
                placeholder={field === "phone" ? "+90" : undefined}
                className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-primary"
              />
            )}
            {errors[field] && (
              <p id={`${id}-${field}-error`} role="alert" className="mt-1 text-xs text-destructive">
                {tx(errors[field]?.message)}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            {...register("consent")}
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span>
            <a
              href="/kvkk-aydinlatma-metni/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {tx("KVKK Aydınlatma Metni")}
            </a>{" "}
            {tx(
              "kapsamında kişisel verilerimin işlenmesini ve tarafımla iletişime geçilmesini kabul ediyorum.",
            )}
          </span>
        </label>
        {errors.consent && (
          <p id={`${id}-consent-error`} role="alert" className="mt-1 text-xs text-destructive">
            {tx(errors.consent.message)}
          </p>
        )}
      </div>
      {failure && (
        <p role="alert" className="text-sm text-destructive">
          {tx("Form gönderilemedi. Bilgileriniz korunuyor; lütfen tekrar deneyin.")}
        </p>
      )}
      <Button type="submit" size="touch" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        {tx(isSubmitting ? "Gönderiliyor…" : "Devamını İzle")}
      </Button>
    </form>
  );
}
