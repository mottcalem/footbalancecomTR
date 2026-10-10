import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { canonicalUrl } from "@/lib/seo";
import { languagePath } from "@/lib/i18n/urls";

const GA4_ID = "G-XBVGTE635G";
const LEGACY_ID = "UA-65716654-14";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export function Analytics() {
  const location = useRouterState({ select: (s) => s.location });
  useEffect(() => {
    if (!["footbalance.com.tr", "www.footbalance.com.tr"].includes(window.location.hostname))
      return;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        window.dataLayer!.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA4_ID, { send_page_view: false });
      // Retain the supplied legacy tag; GA4 is the active measurement destination.
      window.gtag("config", LEGACY_ID, { send_page_view: false });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      document.head.appendChild(script);
    }
    window.gtag("event", "page_view", {
      send_to: GA4_ID,
      page_location: canonicalUrl(
        languagePath(location.pathname, location.search.lang === "en" ? "en" : "tr"),
      ),
      page_title: document.title,
    });
  }, [location.pathname, location.search.lang]);
  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ event?: string; [key: string]: unknown }>).detail;
      if (detail?.event && window.gtag) {
        const { event: name, ...params } = detail;
        window.gtag("event", name, { ...params, send_to: GA4_ID });
      }
    };
    window.addEventListener("footbalance:analytics", listener);
    return () => window.removeEventListener("footbalance:analytics", listener);
  }, []);
  return null;
}
