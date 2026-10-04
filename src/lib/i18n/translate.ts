import english from "./en.json";

export type Language = "tr" | "en";
const translations: Record<string, string> = english;
const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

export function translate(
  text: string | undefined,
  language: Language = "tr",
  values: Record<string, string> = {},
): string {
  if (text === undefined) return "";
  const result = language === "en" ? (translations[normalizeText(text)] ?? text) : text;
  return result.replace(/\{(\w+)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
}
