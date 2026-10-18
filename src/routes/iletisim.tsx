import { existingPageHead } from "@/lib/seo";
import { translate, useTranslation, LanguageSwitcher } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/footbalance-logo.svg";

export const Route = createFileRoute("/iletisim")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) =>
    existingPageHead(
      "/iletisim",
      match.search.lang,
      translate("İletişim | FootBalance Türkiye", match.search.lang),
      translate(
        "FootBalance Türkiye Merkez Ofis iletişim bilgileri, çalışma saatleri ve iletişim formu. Randevu talebi, geri bildirim ve çözüm ortaklığı için bize ulaşın.",
        match.search.lang,
      ),
    ),
  component: ContactPage,
});

const PHONE = "+(90) 212 325 88 51";
const EMAIL = "info@onbrands.com.tr";
const ADDRESS = "Esentepe Mahallesi, Atom Sok. No:20, Kanyon Apt. Kat:3 Daire: 5 Şişli / İSTANBUL";

const SUBJECTS = ["Randevu Talebi", "Geri Bildirim", "Çözüm Ortağı Ol", "Diğer"] as const;

function ContactPage() {
  const { tx, language } = useTranslation();
  const [menu, setMenu] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submission = useRef<{ payload: string; id: string } | null>(null);

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-2 px-4 sm:gap-6 sm:px-5 lg:px-8">
          <Link to="/" aria-label={tx("FootBalance Türkiye ana sayfa")} className="shrink-0">
            <img src={logo} alt="FootBalance" className="h-8 w-auto" />
          </Link>
          <nav
            aria-label={tx("Ana menü")}
            className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex"
          >
            <Link to="/" hash="nedir">
              {tx("Kişiye Özel Tabanlık")}
            </Link>
            <Link to="/" hash="teknoloji">
              {tx("Nasıl Hazırlanır?")}
            </Link>
            <Link to="/merkezler/">{tx("Merkezler")}</Link>
            <Link to="/hakkimizda/">{tx("Hakkımızda")}</Link>
          </nav>
          <Link
            to="/cozum-ortagi-ol/"
            className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex"
          >
            {tx("Çözüm Ortağı Ol")}
          </Link>
          <Link to="/randevu/" className="hidden sm:inline-flex">
            <Button type="button" variant="appointment" size="touch">
              {tx("Randevu Al")}
            </Button>
          </Link>
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
          <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden">
            <Link className="py-3" to="/" onClick={() => setMenu(false)}>
              {tx("Ana Sayfa")}
            </Link>
            <Link className="py-3" to="/merkezler/" onClick={() => setMenu(false)}>
              {tx("Merkez Bul")}
            </Link>
            <Link className="py-3" to="/hakkimizda/" onClick={() => setMenu(false)}>
              {tx("Hakkımızda")}
            </Link>
            <Link className="py-3" to="/cozum-ortagi-ol/" onClick={() => setMenu(false)}>
              {tx("Çözüm Ortağı Ol")}
            </Link>
          </nav>
        )}
      </header>

      <main>
        <section className="bg-secondary">
          <div className="mx-auto max-w-[1360px] px-5 py-14 md:py-20 lg:px-8">
            <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">
              {tx("Bize Ulaşın")}
            </p>
            <h1 className="max-w-[18ch] text-[40px] font-semibold leading-[1.04] sm:text-5xl lg:text-[64px]">
              {tx("FootBalance Türkiye Merkez Ofis")}
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted-foreground">
              {tx(
                "Randevu talebi, geri bildirim veya çözüm ortaklığı için bize telefon, e-posta ya da aşağıdaki form üzerinden ulaşabilirsin.",
              )}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="tel:+902123258851"
                className="rounded-xl border border-border bg-background p-5 hover:border-primary"
              >
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  {tx("Telefon")}
                </p>
                <p className="mt-1 text-base font-semibold">{PHONE}</p>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="rounded-xl border border-border bg-background p-5 hover:border-primary"
              >
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  {tx("E-posta")}
                </p>
                <p className="mt-1 break-all text-base font-semibold">{EMAIL}</p>
              </a>
              <div className="rounded-xl border border-border bg-background p-5 sm:col-span-2">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  {tx("Adres")}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6">{ADDRESS}</p>
              </div>
              <p className="text-sm text-muted-foreground sm:col-span-2">
                {tx("Hafta içi: 09:00 - 19:00 · Cumartesi: 10:00 - 17:00")}
              </p>
            </div>
          </div>
        </section>

        <section id="form" className="bg-background">
          <div className="mx-auto grid max-w-[1180px] items-start gap-8 px-5 py-12 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-14">
            <div className="max-w-xl lg:col-span-5 lg:pt-2">
              <p className="text-sm font-bold uppercase text-muted-foreground">
                {tx("İletişim Formu")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                {tx("Mesajını bize ilet.")}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-[17px]">
                {tx(
                  "Formu doldur, ekibimiz en kısa sürede seninle iletişime geçsin. Randevu için dilersen doğrudan sana en yakın merkeze de ulaşabilirsin.",
                )}
              </p>
              <Link to="/merkezler/" className="mt-7 inline-flex">
                <Button type="button" variant="quiet" size="touch">
                  {tx("Merkez Bul")} <ArrowRight />
                </Button>
              </Link>
            </div>
            <div className="min-w-0 lg:col-span-7">
              {sent ? (
                <div
                  role="status"
                  className="rounded-xl border border-border bg-secondary p-6 sm:p-8"
                >
                  <h3 className="text-xl font-semibold">{tx("Mesajın bize ulaştı!")}</h3>
                  <p className="mt-3 text-muted-foreground">
                    {tx(
                      "Bizimle iletişime geçtiğin için teşekkür ederiz. Ekibimiz en kısa sürede sana dönüş yapacak.",
                    )}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    {tx("Bize daha hızlı ulaşmak istersen")}{" "}
                    <a
                      href="tel:+902123258851"
                      className="font-bold text-foreground underline-offset-4 hover:underline"
                    >
                      0212 325 88 51
                    </a>{" "}
                    {tx("numaralı telefondan iletişime geçebilirsin.")}
                  </p>
                  <Button
                    type="button"
                    variant="quiet"
                    size="touch"
                    className="mt-6"
                    onClick={() => {
                      setSent(false);
                      submission.current = null;
                    }}
                  >
                    {tx("Yeni Mesaj Gönder")}
                  </Button>
                </div>
              ) : (
                <form
                  className="grid gap-x-3 gap-y-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (sending) return;
                    const form = new FormData(e.currentTarget);
                    const values = {
                      type: "contact",
                      language,
                      name: String(form.get("name") ?? ""),
                      phone: String(form.get("phone") ?? ""),
                      email: String(form.get("email") ?? ""),
                      city: String(form.get("city") ?? ""),
                      subject: String(form.get("subject") ?? ""),
                      message: String(form.get("message") ?? ""),
                      website: String(form.get("website") ?? ""),
                      consent: form.get("consent") === "on",
                    };
                    const payload = JSON.stringify(values);
                    if (submission.current?.payload !== payload)
                      submission.current = { payload, id: crypto.randomUUID() };
                    setSending(true);
                    setSubmitError("");
                    try {
                      const response = await fetch("/api/requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...values, submissionId: submission.current.id }),
                        signal: AbortSignal.timeout(60000),
                      });
                      const result = await response.json();
                      if (!response.ok || result.ok !== true)
                        throw new Error("Contact delivery failed");
                      setSent(true);
                    } catch {
                      setSubmitError(
                        "Talebiniz gönderilemedi. Bilgileriniz korunuyor; tekrar deneyebilir veya bize telefonla ulaşabilirsiniz.",
                      );
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  <div className="hidden" aria-hidden="true">
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                  <label className="block text-sm font-semibold sm:col-span-2">
                    {tx("Konu")}{" "}
                    <select
                      name="subject"
                      required
                      defaultValue=""
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal"
                    >
                      <option value="" disabled>
                        {tx("Seçiniz")}
                      </option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {tx(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    {tx("Ad Soyad")}
                    <input
                      name="name"
                      maxLength={100}
                      required
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    {tx("Telefon")}
                    <input
                      name="phone"
                      maxLength={30}
                      required
                      type="tel"
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    {tx("E-posta")}
                    <input
                      name="email"
                      maxLength={254}
                      required
                      type="email"
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    {tx("Bulunduğunuz Şehir?")}{" "}
                    <input
                      name="city"
                      maxLength={80}
                      required
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal"
                      placeholder={tx("Şehrinizi yazın")}
                    />
                  </label>
                  <label className="block text-sm font-semibold sm:col-span-2">
                    {tx("Mesajınız")}
                    <textarea
                      name="message"
                      maxLength={2000}
                      required
                      rows={4}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 font-normal"
                    />
                  </label>
                  <label className="flex gap-3 text-sm leading-6 sm:col-span-2">
                    <input name="consent" required type="checkbox" className="mt-1 size-5" />{" "}
                    {tx("KVKK aydınlatma metnini okudum ve iletişim kurulmasına onay veriyorum.")}
                  </label>
                  <div className="sm:col-span-2">
                    {submitError && (
                      <p role="alert" className="mb-3 text-sm text-destructive">
                        {tx(submitError)}
                      </p>
                    )}
                    <Button type="submit" variant="appointment" size="wide" disabled={sending}>
                      {tx(sending ? "Gönderiliyor…" : "Mesajı Gönder")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-2 border-t border-border bg-background md:hidden">
        <Link
          to="/merkezler/"
          className="flex h-full items-center justify-center gap-2 text-sm font-semibold"
        >
          <MapPin className="size-4" /> {tx("Merkez Bul")}
        </Link>
        <Link to="/randevu/" className="h-full">
          <Button className="h-full w-full rounded-none">{tx("Randevu Al")}</Button>
        </Link>
      </div>
    </div>
  );
}
