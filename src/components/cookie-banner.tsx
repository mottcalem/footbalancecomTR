import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import {
  CONSENT_EVENT,
  CONSENT_KEY,
  SETTINGS_EVENT,
  NO_OPTIONAL_COOKIES,
  clearOptionalCookies,
  readConsent,
  type CookiePreferences,
} from "@/lib/cookie-consent";

export function CookieBanner() {
  const { language } = useTranslation();
  const en = language === "en";
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(NO_OPTIONAL_COOKIES);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sync = () => {
      const consent = readConsent();
      setPreferences(consent ?? NO_OPTIONAL_COOKIES);
      setVisible(!consent);
    };
    const open = () => {
      sync();
      setSettings(true);
    };
    sync();
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);

  const save = (next: CookiePreferences) => {
    const previous = readConsent();
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ ...next, version: 1, savedAt: Date.now() }),
      );
    } catch {
      setError(true);
      return;
    }
    const withdrawn =
      previous &&
      (Object.keys(next) as (keyof CookiePreferences)[]).some((key) => previous[key] && !next[key]);
    if (withdrawn) {
      clearOptionalCookies();
      // A fresh document stops third-party code already running in this document.
      window.location.reload();
      return;
    }
    setPreferences(next);
    setVisible(false);
    setSettings(false);
    setError(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };
  const all = { analytics: true, marketing: true, support: true };
  const buttons = (
    <>
      <Button
        variant="outline"
        className="min-h-11 whitespace-normal"
        onClick={() => save(NO_OPTIONAL_COOKIES)}
      >
        {en ? "Reject optional cookies" : "İsteğe bağlı çerezleri reddet"}
      </Button>
      <Button className="min-h-11" onClick={() => save(all)}>
        {en ? "Accept all" : "Tümünü kabul et"}
      </Button>
    </>
  );
  const failure = error && (
    <p role="alert" className="text-sm text-destructive">
      {en
        ? "Your preferences could not be saved. Please allow browser storage and try again. Optional services remain disabled until preferences are saved."
        : "Tercihleriniz kaydedilemedi. Tarayıcı depolama iznini kontrol edip tekrar deneyin. Tercihler kaydedilene kadar isteğe bağlı servisler açılmaz."}
    </p>
  );

  return (
    <>
      {visible && (
        <section
          aria-label={en ? "Cookie preferences" : "Çerez tercihleri"}
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[85dvh] overflow-y-auto border-t border-border bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] sm:p-6"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-5 xl:flex-row xl:items-center">
            <div className="flex-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Cookie className="size-5 text-primary" aria-hidden="true" />
                {en ? "Your cookie preferences" : "Çerez tercihleriniz"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {en
                  ? "We use essential cookies to run the site. Analytics, marketing and live support services are enabled only with your permission. You can change your choice at any time in the footer."
                  : "Sitenin çalışması için zorunlu çerezler kullanıyoruz. Analiz, pazarlama ve canlı destek servislerini yalnızca izninizle açıyoruz. Tercihlerinizi alt menüden dilediğiniz zaman değiştirebilirsiniz."}{" "}
                <a
                  href="/cerez-politikasi-ve-aydinlatma-metni/"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {en ? "Cookie policy" : "Çerez Politikası"}
                </a>
              </p>
              {failure}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:max-w-md">
              <Button variant="outline" className="min-h-11" onClick={() => setSettings(true)}>
                {en ? "Preferences" : "Tercihleri düzenle"}
              </Button>
              {buttons}
            </div>
          </div>
        </section>
      )}
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent className="z-[70] max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl">
          <DialogTitle>{en ? "Cookie preferences" : "Çerez tercihleri"}</DialogTitle>
          <DialogDescription>
            {en
              ? "Optional categories are off by default. Choose which services you allow."
              : "İsteğe bağlı kategoriler varsayılan olarak kapalıdır. İzin verdiğiniz servisleri seçin."}
          </DialogDescription>
          <div className="divide-y divide-border">
            <div className="py-4">
              <p className="font-semibold">
                {en ? "Essential · Always active" : "Zorunlu · Her zaman etkin"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {en
                  ? "Security, basic site functions and saving your cookie preferences."
                  : "Güvenlik, temel site işlevleri ve çerez tercihlerinizin saklanması."}
              </p>
            </div>
            {(
              [
                [
                  "analytics",
                  en ? "Analytics" : "Analiz",
                  en
                    ? "Google Analytics and Microsoft Clarity help us understand site usage."
                    : "Google Analytics ve Microsoft Clarity ile site kullanımını anlamamıza yardımcı olur.",
                ],
                [
                  "marketing",
                  en ? "Marketing" : "Pazarlama",
                  en
                    ? "Meta Pixel measures advertising. Tag Manager runs only when both analytics and marketing are allowed."
                    : "Meta Pixel ile reklam performansı ölçülür. Tag Manager, analiz ve pazarlama izinleri birlikte verildiğinde açılır.",
                ],
                [
                  "support",
                  en ? "Live support" : "Canlı destek",
                  en
                    ? "Enables the Supsis chat service."
                    : "Supsis sohbet servisinin çalışmasını sağlar.",
                ],
              ] as const
            ).map(([key, title, description]) => (
              <label key={key} className="flex cursor-pointer items-start gap-4 py-4">
                <span className="flex-1">
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(event) =>
                    setPreferences({ ...preferences, [key]: event.target.checked })
                  }
                  className="mt-1 size-5 shrink-0 accent-primary"
                />
              </label>
            ))}
          </div>
          {failure}
          <Button className="min-h-11" onClick={() => save(preferences)}>
            {en ? "Save preferences" : "Tercihlerimi kaydet"}
          </Button>
          <div className="flex flex-col gap-2">{buttons}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
