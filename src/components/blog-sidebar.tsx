import { ArrowUpRight } from "lucide-react";
import posts from "@/data/blog-index.json";
import { useTranslation } from "@/lib/i18n";

export function BlogSidebar({ currentPath, language }: { currentPath: string; language: string }) {
  const { tx } = useTranslation();
  const localizedPosts = posts.filter((post) => post.language === language);
  const recentPosts = localizedPosts
    .filter((post) => post.path !== currentPath)
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
    .slice(0, 5);
  const categories = [...new Set(localizedPosts.flatMap((post) => post.categories))]
    .filter((category) => !/^uncategorized/i.test(category))
    .sort((a, b) => a.localeCompare(b, language));
  const archivePath =
    language === "en" ? "/en/foot-health-blog/" : "/ayak-sagligi-hakkinda-bilgiler/";

  return (
    <aside
      aria-label={language === "en" ? "Blog sidebar" : "Blog yan menüsü"}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">
          {language === "en" ? "Latest posts" : "Son Yazılar"}
        </h2>
        <ul className="mt-5 divide-y divide-border">
          {recentPosts.map((post) => (
            <li key={post.path} className="py-4 first:pt-0 last:pb-0">
              <a href={post.path} className="group flex items-start gap-3">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-16 w-20 shrink-0 rounded-lg object-cover"
                  />
                )}
                <span className="text-sm font-semibold leading-5 group-hover:underline">
                  {post.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <h2 className="text-xl font-semibold">{tx("Prof. Dr. Gül Baltacı röportajı")}</h2>
        <p className="mt-3 text-sm leading-6">
          {tx(
            "Meslekte Fark Yaratan Fizyoterapistler: Prof. Dr. Gül Baltacı ile Kariyer ve Başarı",
          )}
        </p>
        <a
          href={language === "en" ? "/en/prof-dr-gul-baltaci/" : "/prof-dr-gul-baltaci/"}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground"
        >
          {tx("Hemen İzle")} <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </section>
      {categories.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">
            {language === "en" ? "Categories" : "Kategoriler"}
          </h2>
          <ul className="mt-4 space-y-3">
            {categories.map((category) => (
              <li key={category}>
                <a
                  href={`${archivePath}?category=${encodeURIComponent(category)}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
