import { NotFoundPage } from "@/components/not-found-page";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@/components/analytics";
import { ScrollToTop } from "@/components/scroll-to-top";
import { jsonLd } from "@/lib/seo";
import { useTranslation, translate, LanguageProvider } from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  retainSearchParams,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MapPin } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { tx } = useTranslation();
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {tx("Bu sayfa yüklenemedi")}{" "}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx("Bir sorun oluştu. Sayfayı yenileyebilir veya ana sayfaya dönebilirsiniz.")}{" "}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tx("Tekrar dene")}{" "}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {tx("Ana sayfaya dön")}{" "}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | undefined } =>
    search["lang"] === "en" ? { lang: "en" } : {},
  search: { middlewares: [retainSearchParams(["lang"])] },
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: translate("FootBalance Türkiye", match.search.lang) },
      {
        name: "description",
        content: translate("Kişiye özel ortopedik tabanlık ve ayak analizi.", match.search.lang),
      },
      { name: "author", content: translate("FootBalance Türkiye", match.search.lang) },
      { property: "og:title", content: translate("FootBalance Türkiye", match.search.lang) },
      {
        property: "og:description",
        content: translate("Kişiye özel ortopedik tabanlık ve ayak analizi.", match.search.lang),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "pYFQuT79Ob7oSB9l2quOdhnLKq9CzHanxbTrrUAQ0C8" },
      { name: "verification", content: "f612c7d25f5690ad41496fcfdbf8d1" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap",
      },
      { rel: "llms-sitemap", href: "https://footbalance.com.tr/llms.txt" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "FootBalance Blog",
        href: "https://footbalance.com.tr/feed/",
      },
      { rel: "icon", href: "/favicon.svg?v=footbalance333", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const language = useRouterState({
    select: (state) => (state.location.search.lang === "en" ? ("en" as const) : ("tr" as const)),
  });
  return (
    <LanguageProvider language={language}>
      <html lang={language}>
        <head>
          <script
            id="google-tag-manager"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T4T2LQLH');`,
            }}
          />
          <script
            id="meta-pixel"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','258016955490147');
fbq('track','PageView');`,
            }}
          />
          <script
            id="microsoft-clarity"
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "z17gdw3hei");`,
            }}
          />
          <HeadContent />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://footbalance.com.tr/#organization",
                    name: "FootBalance",
                    url: "https://footbalance.com.tr/",
                    logo: "https://footbalance.com.tr/favicon.svg",
                    sameAs: [
                      "https://www.facebook.com/FootBalanceTR",
                      "https://www.instagram.com/FootBalanceTR/",
                      "https://www.youtube.com/channel/UCFnMmPY9CVrzRmI7v_8D2gg",
                      "https://twitter.com/FootBalanceTR",
                      "https://www.linkedin.com/company/footbalance-t%C3%BCrkiye/",
                    ],
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://footbalance.com.tr/#website",
                    url: "https://footbalance.com.tr/",
                    name: "FootBalance Türkiye",
                    publisher: { "@id": "https://footbalance.com.tr/#organization" },
                    inLanguage: ["tr", "en"],
                  },
                ],
              }),
            }}
          />
        </head>
        <body>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=258016955490147&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
          {children}
          <Scripts />
          <script
            id="supsis-init"
            dangerouslySetInnerHTML={{
              __html: `window.supsis = window.supsis || function () {
    (supsis.q = supsis.q || []).push(arguments);
};
supsis.l = +new Date();`,
            }}
          />
          <script
            src="https://footbalance.visitor.supsis.live/static/js/loader.js"
            type="text/javascript"
            defer
          />
        </body>
      </html>
    </LanguageProvider>
  );
}

function RootComponent() {
  const { tx } = useTranslation();
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <SiteFooter />
      <Analytics />
      <ScrollToTop />
      {pathname.replace(/\/$/, "") !== "/merkezler" &&
        pathname.replace(/\/$/, "") !== "/randevu" &&
        pathname.replace(/\/$/, "") !== "/cozum-ortagi-ol" && (
          <Link
            to="/merkezler/"
            className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-2 rounded-l-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-x-1 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:inline-flex"
          >
            <MapPin className="size-4" aria-hidden="true" />
            {tx("Merkez Bul")}{" "}
          </Link>
        )}
    </QueryClientProvider>
  );
}
