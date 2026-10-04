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

function NotFoundComponent() {
  const { tx } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{tx("Sayfa bulunamadı")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx("Aradığınız sayfa mevcut değil veya taşınmış.")}{" "}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tx("Ana sayfaya dön")}{" "}
          </Link>
        </div>
      </div>
    </div>
  );
}

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
      { rel: "icon", href: "/favicon.svg?v=footbalance333", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
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
          <HeadContent />
        </head>
        <body>
          {children}
          <Scripts />
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
      {pathname !== "/merkezler" &&
        pathname !== "/randevu" &&
        pathname.replace(/\/$/, "") !== "/cozum-ortagi-ol" && (
          <Link
            to="/merkezler"
            className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-2 rounded-l-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-x-1 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:inline-flex"
          >
            <MapPin className="size-4" aria-hidden="true" />
            {tx("Merkez Bul")}{" "}
          </Link>
        )}
    </QueryClientProvider>
  );
}
