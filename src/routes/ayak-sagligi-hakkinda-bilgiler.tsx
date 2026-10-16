import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import posts from "@/data/blog-index.json";
import { InterviewBanner } from "@/components/interview-banner";
import { ContentLayout } from "@/components/content-layout";
import { existingPageHead } from "@/lib/seo";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/ayak-sagligi-hakkinda-bilgiler")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { category?: string | undefined; q?: string | undefined } => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    q: typeof search["q"] === "string" ? search["q"].slice(0, 200) : undefined,
  }),
  head: ({ match }) =>
    existingPageHead(
      "/ayak-sagligi-hakkinda-bilgiler",
      match.search.lang,
      "Ayak Sağlığı Rehberi | FootBalance Türkiye",
      "Ayak sağlığı, kişiye özel ortopedik tabanlıklar ve spor performansı hakkında FootBalance yazılarını okuyun.",
    ),
  component: BlogArchive,
});
function BlogArchive() {
  const { language, tx } = useTranslation();
  const { category, q: query = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [page, setPage] = useState(1);
  const list = posts.filter(
    (p) =>
      p.language === language &&
      (!category || p.categories.includes(category)) &&
      `${p.title} ${p.description}`
        .toLocaleLowerCase(language === "tr" ? "tr-TR" : "en")
        .includes(query.toLocaleLowerCase(language === "tr" ? "tr-TR" : "en")),
  );
  const pageCount = Math.ceil(list.length / 18);
  return (
    <ContentLayout>
      <InterviewBanner />
      <h1 className="mt-8 text-3xl font-semibold sm:text-4xl">{tx("Ayak Sağlığı Rehberi")}</h1>
      <p className="mt-4 text-muted-foreground">
        {tx("Ayak sağlığı, tabanlık kullanımı ve spor performansı hakkında güncel yazılar.")}
      </p>
      {category && (
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-muted px-4 py-2 font-medium">{category}</span>
          <a
            href={language === "en" ? "/en/foot-health-blog/" : "/ayak-sagligi-hakkinda-bilgiler/"}
            className="font-semibold underline underline-offset-4"
          >
            {language === "en" ? "All posts" : "Tüm yazılar"}
          </a>
        </div>
      )}
      <input
        aria-label={tx("Yazılarda ara")}
        type="search"
        maxLength={200}
        value={query}
        onChange={(e) => {
          const q = e.target.value;
          void navigate({
            search: (previous) => ({ ...previous, q: q || undefined }),
            replace: true,
          });
          setPage(1);
        }}
        placeholder={tx("Yazılarda ara")}
        className="mt-6 h-12 w-full rounded-full border border-border px-5 sm:max-w-md"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice((page - 1) * 18, page * 18).map((p) => (
          <a
            key={p.path}
            href={p.path}
            className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary hover:shadow-md"
          >
            {p.image && (
              <img src={p.image} alt="" loading="lazy" className="h-44 w-full object-cover" />
            )}
            <div className="p-5">
              <h2 className="text-lg font-semibold leading-6">{p.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{p.description}</p>
              <span className="mt-4 block text-sm font-semibold">{tx("Yazıyı oku →")}</span>
            </div>
          </a>
        ))}
      </div>
      {!list.length && <p className="mt-8">{tx("Aramanla eşleşen yazı bulunamadı.")}</p>}
      {pageCount > 1 && (
        <div
          className="mt-8 flex flex-wrap justify-center gap-2"
          aria-label={language === "en" ? "Pagination" : "Sayfalar"}
        >
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              aria-current={page === i + 1 ? "page" : undefined}
              onClick={() => setPage(i + 1)}
              className={`size-11 rounded-full border border-border ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </ContentLayout>
  );
}
