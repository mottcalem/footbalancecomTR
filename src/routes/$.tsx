import { createFileRoute, notFound } from "@tanstack/react-router";
import { getLegacyContent } from "@/lib/content";
import { seoHead, canonicalUrl, jsonLd } from "@/lib/seo";
import { ContentLayout } from "@/components/content-layout";

export const Route = createFileRoute("/$")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  loader: async ({ params, deps }) => {
    const content = await getLegacyContent({
      data: `${deps.lang === "en" ? "/en" : ""}/${params._splat ?? ""}`,
    });
    if (!content) throw notFound();
    return content;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ name: "robots", content: "noindex, follow" }] };
    if (loaderData.kind === "post") {
      const p = loaderData.post;
      return seoHead({
        title: p.seoTitle,
        description: p.description,
        path: p.path,
        image: p.image,
        language: p.language,
        article: true,
      });
    }
    const p = loaderData.page;
    return seoHead({
      title: p.title || "FootBalance Türkiye",
      description:
        p.description ||
        "Bu sayfanın içeriği güncellenmektedir. FootBalance Türkiye merkezleri ve kişiye özel ortopedik tabanlıklar hakkında bilgi için bize ulaşın.",
      path: p.path,
      image: p.image,
      language: p.path.startsWith("/en/") ? "en" : "tr",
      noindex: /\/(basarili|tesekkurler)\/$/.test(p.path),
    });
  },
  component: LegacyContent,
});
function LegacyContent() {
  const content = Route.useLoaderData();
  if (content.kind === "page") {
    const p = content.page;
    return (
      <ContentLayout>
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 sm:p-12">
          <h1 className="text-3xl font-semibold">{(p.title || "FootBalance").split(" | ")[0]}</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {p.path.startsWith("/en/") ? "Content is being updated." : "İçerik güncellenmektedir."}
          </p>
        </div>
      </ContentLayout>
    );
  }
  const p = content.post;
  return (
    <ContentLayout>
      <article className="mx-auto max-w-3xl">
        <a
          href={p.language === "en" ? "/en/foot-health-blog/" : "/ayak-sagligi-hakkinda-bilgiler/"}
          className="text-sm font-semibold text-muted-foreground"
        >
          {p.language === "en" ? "← Foot Health Blog" : "← Ayak Sağlığı Rehberi"}
        </a>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">{p.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          FootBalance ·{" "}
          <time dateTime={p.published}>
            {new Intl.DateTimeFormat(p.language === "en" ? "en-GB" : "tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Europe/Istanbul",
            }).format(new Date(p.published))}
          </time>
        </p>
        {p.image && (
          <img
            src={p.image}
            alt={p.title}
            className="mt-8 max-h-[480px] w-full rounded-2xl object-contain"
          />
        )}
        <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: p.content }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: p.title,
              description: p.description,
              datePublished: p.published,
              dateModified: p.modified,
              inLanguage: p.language,
              ...(p.image ? { image: canonicalUrl(p.image) } : {}),
              author: { "@type": "Organization", name: "FootBalance" },
              publisher: { "@id": "https://footbalance.com.tr/#organization" },
              mainEntityOfPage: canonicalUrl(p.path),
            }),
          }}
        />
      </article>
    </ContentLayout>
  );
}
