import { ArrowRight, Home, Search } from "lucide-react";
import { ContentLayout } from "@/components/content-layout";
import popularPosts from "@/data/popular-posts.json";
import { useTranslation } from "@/lib/i18n";
import { languagePath } from "@/lib/i18n/urls";

export function NotFoundPage() {
  const { language, tx } = useTranslation();
  const english = language === "en";
  const archivePath = languagePath("/ayak-sagligi-hakkinda-bilgiler", language);
  return (
    <ContentLayout>
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-7xl font-bold tracking-tight text-primary sm:text-8xl">404</p>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">{tx("Sayfa bulunamadı")}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {english
            ? "The page you’re looking for may have moved or no longer exists. Search our blog or explore the popular articles below."
            : "Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Blogda arama yapabilir ya da aşağıdaki popüler yazılara göz atabilirsiniz."}
        </p>
        <form method="get" action={archivePath} role="search" className="mt-7">
          <label htmlFor="not-found-search" className="sr-only">
            {tx("Yazılarda ara")}
          </label>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-2 sm:flex-nowrap sm:rounded-full">
            <div className="flex min-w-0 flex-1 items-center gap-3 pl-3">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="not-found-search"
                type="search"
                name="q"
                required
                maxLength={200}
                placeholder={
                  english
                    ? "Search foot health, insoles and more"
                    : "Ayak sağlığı, tabanlık ve daha fazlası"
                }
                className="h-11 w-full min-w-0 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
            >
              {english ? "Search" : "Ara"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </form>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold">
          <a
            href={languagePath("/", language)}
            className="inline-flex min-h-11 items-center gap-2 hover:underline"
          >
            <Home className="size-4" aria-hidden="true" />
            {tx("Ana sayfaya dön")}
          </a>
          <a href={archivePath} className="inline-flex min-h-11 items-center gap-2 hover:underline">
            {english ? "Browse all articles" : "Tüm yazıları keşfet"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        aria-labelledby="popular-posts-title"
        className="mt-12 border-t border-border pt-8 sm:mt-16"
      >
        <h2 id="popular-posts-title" className="text-2xl font-semibold">
          {english ? "Popular articles" : "Popüler Yazılar"}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularPosts[language].map((post) => (
            <a
              key={post.path}
              href={post.path}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <img
                src={post.image}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                className="size-20 shrink-0 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold leading-6 group-hover:underline">
                  {post.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  {english ? "Read article" : "Yazıyı oku"}
                  <ArrowRight className="size-3" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </ContentLayout>
  );
}
