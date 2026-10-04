import { type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LanguageContext, useTranslation } from "./context";
import { languagePath } from "./urls";
import { type Language } from "./translate";
export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export function LanguageSwitcher() {
  const { language } = useTranslation();
  const location = useRouterState({ select: (state) => state.location });
  return (
    <div
      role="group"
      aria-label={language === "en" ? "Site language" : "Site dili"}
      className="flex shrink-0 items-center gap-1"
    >
      {(
        [
          { code: "tr", label: "Türkçe", flag: "/flags/tr.svg" },
          { code: "en", label: "English", flag: "/flags/gb.svg" },
        ] as const
      ).map(({ code, label, flag }) => {
        const search = new URLSearchParams(location.searchStr);
        search.delete("lang");
        const query = search.toString();
        const href = `${languagePath(location.pathname, code)}${query ? `?${query}` : ""}${location.hash ? `#${location.hash}` : ""}`;
        return (
          <a
            key={code}
            href={href}
            lang={code}
            hrefLang={code}
            aria-label={label}
            title={label}
            aria-current={language === code ? "true" : undefined}
            className={`relative grid h-11 w-8 place-items-center rounded-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${language === code ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <img
              src={flag}
              alt=""
              aria-hidden="true"
              width={18}
              height={12}
              className="h-3 w-[18px] rounded-[1px]"
            />
            {language === code && (
              <span aria-hidden="true" className="absolute bottom-2 h-px w-3 bg-foreground/50" />
            )}
          </a>
        );
      })}
    </div>
  );
}
