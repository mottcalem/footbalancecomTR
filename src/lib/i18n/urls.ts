import type { LocationRewrite } from "@tanstack/react-router";
import type { Language } from "./translate";

export function languagePath(pathname: string, language: Language): string {
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return language === "en" ? `/en${path === "/" ? "" : path}` : path;
}

// Keep existing route IDs while exposing the language as a public path prefix.
export const languageRewrite = {
  input: ({ url }) => {
    const result = new URL(url);
    if (/^\/en(?:\/|$)/.test(result.pathname)) {
      result.pathname = languagePath(result.pathname, "tr");
      result.searchParams.set("lang", "en");
    }
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
