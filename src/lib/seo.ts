import pages from "@/data/legacy-pages.json";
import { languagePath } from "@/lib/i18n/urls";

export const SITE_URL = "https://footbalance.com.tr";
export const DEFAULT_IMAGE = `${SITE_URL}/wp-content/uploads/2023/07/thumb.jpg`;
export function canonicalUrl(path: string) {
  return new URL(path, SITE_URL).href;
}
export function seoHead({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  language = "tr",
  article = false,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  language?: string;
  article?: boolean;
  noindex?: boolean;
}) {
  const url = canonicalUrl(path);
  const imageUrl = canonicalUrl(image || DEFAULT_IMAGE);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex
          ? "noindex, follow"
          : "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: article ? "article" : "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "FootBalance" },
      { property: "og:locale", content: language === "en" ? "en_GB" : "tr_TR" },
      { property: "og:image", content: imageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
export function existingPageHead(
  route: string,
  language: "en" | undefined,
  fallbackTitle: string,
  fallbackDescription: string,
) {
  const lang = language ?? "tr";
  const path = languagePath(route, lang);
  const page = pages.find((p) => p.path === path);
  const head = seoHead({
    title: page?.title || fallbackTitle,
    description: page?.description || fallbackDescription,
    path,
    language: lang,
    image: page?.image || DEFAULT_IMAGE,
  });
  return {
    ...head,
    links: [
      ...head.links,
      { rel: "alternate", hrefLang: "tr", href: canonicalUrl(languagePath(route, "tr")) },
      { rel: "alternate", hrefLang: "en", href: canonicalUrl(languagePath(route, "en")) },
      { rel: "alternate", hrefLang: "x-default", href: canonicalUrl(languagePath(route, "tr")) },
    ],
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
