import { createFileRoute, notFound } from "@tanstack/react-router";
import { languagePath } from "@/lib/i18n/urls";
import { getLegacyContent } from "@/lib/content";
import { seoHead, canonicalUrl, jsonLd } from "@/lib/seo";
import { ProductCatalog, ProductDetail } from "@/components/product-catalog";
import { ContentLayout } from "@/components/content-layout";
import { BlogSidebar } from "@/components/blog-sidebar";
import { VideoLibrary } from "@/components/video-library";

export const Route = createFileRoute("/$")({
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  loader: async ({ params, deps }) => {
    const content = await getLegacyContent({
      data: languagePath(`/${params._splat ?? ""}`, deps.lang === "en" ? "en" : "tr"),
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
    if (p.catalog || p.product) {
      return (
        <ContentLayout>
          {p.catalog ? (
            <ProductCatalog catalog={p.catalog} english={p.path.startsWith("/en/")} />
          ) : p.product ? (
            <ProductDetail product={p.product} english={p.path.startsWith("/en/")} />
          ) : null}
        </ContentLayout>
      );
    }
    return (
      <ContentLayout>
        <div
          className={
            p.testimonials.length || p.path === "/tabanlik-sekillendirme-videolari/"
              ? "mx-auto max-w-6xl"
              : "mx-auto max-w-3xl rounded-3xl border border-border bg-card p-5 sm:p-12"
          }
        >
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {(p.title || "FootBalance").split(" | ")[0]}
          </h1>
          {p.path === "/tabanlik-sekillendirme-videolari/" ? (
            <VideoLibrary />
          ) : p.testimonials.length ? (
            <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
              {p.testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="rounded-2xl border border-border bg-card p-6 sm:p-8"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="size-20 shrink-0 rounded-full object-cover"
                    />
                    <h2 className="text-xl font-semibold">{testimonial.name}</h2>
                  </div>
                  <div
                    className="article-content mt-5 text-sm text-muted-foreground sm:text-base [&_p:first-child]:mt-0"
                    dangerouslySetInnerHTML={{ __html: testimonial.content }}
                  />
                </article>
              ))}
            </div>
          ) : p.content ? (
            <div
              className="article-content mt-8 text-base text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
              dangerouslySetInnerHTML={{ __html: p.content }}
            />
          ) : (
            <p className="mt-6 text-lg text-muted-foreground">
              {p.path.startsWith("/en/")
                ? "Content is being updated."
                : "İçerik güncellenmektedir."}
            </p>
          )}
        </div>
      </ContentLayout>
    );
  }
  const p = content.post;
  return (
    <ContentLayout>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <article className="min-w-0">
          <a
            href={
              p.language === "en" ? "/en/foot-health-blog/" : "/ayak-sagligi-hakkinda-bilgiler/"
            }
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
        <BlogSidebar currentPath={p.path} language={p.language} />
      </div>
    </ContentLayout>
  );
}
