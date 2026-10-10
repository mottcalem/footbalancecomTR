import type { LocationRewrite } from "@tanstack/react-router";
import type { Language } from "./translate";

// Route IDs stay stable; public paths retain the established WordPress URLs.
export const PUBLIC_PATHS: Record<string, { tr: string; en: string }> = {
  "/ayak-sagligi-hakkinda-bilgiler": {
    tr: "/ayak-sagligi-hakkinda-bilgiler/",
    en: "/en/foot-health-blog/",
  },
  "/": { tr: "/", en: "/en/home/" },
  "/merkezler": { tr: "/footbalance-hizmet-noktalari/", en: "/en/footbalance-service-points/" },
  "/randevu": { tr: "/ucretsiz-ayak-analizi/", en: "/en/make-an-appointment/" },
  "/iletisim": { tr: "/bize-ulasin/", en: "/en/contact/" },
  "/hakkimizda": { tr: "/hakkimizda/", en: "/en/about-us/" },
  "/cozum-ortagi-ol": { tr: "/cozum-ortagi-ol/", en: "/en/become-a-partner/" },
};

export function languagePath(pathname: string, language: Language): string {
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const key = path.replace(/\/$/, "") || "/";
  const known =
    PUBLIC_PATHS[key] ??
    Object.values(PUBLIC_PATHS).find((paths) =>
      [paths.tr, paths.en].some(
        (publicPath) => publicPath.replace(/\/$/, "") === pathname.replace(/\/$/, ""),
      ),
    );
  if (known) return known[language];
  return language === "en" ? `/en${path === "/" ? "" : path}` : path;
}

export function internalPath(pathname: string): { path: string; language: Language } {
  for (const [route, paths] of Object.entries(PUBLIC_PATHS)) {
    for (const language of ["tr", "en"] as const) {
      if (pathname.replace(/\/$/, "") === paths[language].replace(/\/$/, "")) {
        return { path: route, language };
      }
    }
  }
  return {
    path: pathname.replace(/^\/en(?=\/|$)/, "") || "/",
    language: /^\/en(?:\/|$)/.test(pathname) ? "en" : "tr",
  };
}

export const languageRewrite = {
  input: ({ url }) => {
    const result = new URL(url);
    const resolved = internalPath(result.pathname);
    result.pathname = resolved.path;
    if (resolved.language === "en") result.searchParams.set("lang", "en");
    return result;
  },
  output: ({ url }) => {
    const result = new URL(url);
    const language = result.searchParams.get("lang") === "en" ? "en" : "tr";
    result.pathname = languagePath(result.pathname, language);
    result.searchParams.delete("lang");
    return result;
  },
} satisfies LocationRewrite;
