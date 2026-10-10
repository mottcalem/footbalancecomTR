import { readFile, writeFile } from "node:fs/promises";
const posts = JSON.parse(await readFile(new URL("../src/data/blog-posts.json", import.meta.url)));
const pages = JSON.parse(await readFile(new URL("../src/data/legacy-pages.json", import.meta.url)));
const base = "https://footbalance.com.tr";
const xml = (s) =>
  String(s).replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c],
  );
const out = (name, content) => writeFile(new URL("../public/" + name, import.meta.url), content);
const index = posts
  .toSorted((a, b) => b.published.localeCompare(a.published))
  .map(({ content, seoTitle, ...p }) => p);
await writeFile(
  new URL("../src/data/blog-index.json", import.meta.url),
  JSON.stringify(index, null, 2) + "\n",
);
const urls = new Map(
  [...pages, ...posts]
    .filter((p) => !/\/(basarili|tesekkurler)\/$/.test(p.path))
    .map((p) => [p.path, p]),
);
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  [...urls.values()]
    .map(
      (p) =>
        `<url><loc>${xml(base + p.path)}</loc>${p.modified ? `<lastmod>${xml(p.modified)}</lastmod>` : ""}${p.image ? `<image:image><image:loc>${xml(new URL(p.image, base).href)}</image:loc></image:image>` : ""}</url>`,
    )
    .join("\n") +
  "\n</urlset>\n";
await out("sitemap.xml", sitemap);
await out(
  "sitemap_index.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${base}/sitemap.xml</loc></sitemap></sitemapindex>\n`,
);
await out(
  "robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /_serverFn/\nDisallow: /basarili/\nDisallow: /tesekkurler/\n\nSitemap: ${base}/sitemap.xml\n`,
);
const llms = `# FootBalance Türkiye\n\n> FootBalance Türkiye: kişiye özel ortopedik tabanlık, ayak ve basış analizi ve yetkili hizmet merkezleri.\n\n## Temel sayfalar\n\n- [Ana sayfa](${base}/)\n- [Ücretsiz ayak analizi ve randevu](${base}/ucretsiz-ayak-analizi/)\n- [Hizmet noktaları](${base}/footbalance-hizmet-noktalari/)\n- [Hakkımızda](${base}/hakkimizda/)\n- [İletişim](${base}/bize-ulasin/)\n- [Blog](${base}/ayak-sagligi-hakkinda-bilgiler/)\n- [Online mağaza](https://shop.footbalance.com.tr/)\n\n## Blog yazıları\n\n${index.map((p) => `- [${p.title.replace(/[\[\]\n]/g, "")}](${base + p.path}): ${p.description.replace(/\n/g, " ")}`).join("\n")}\n\n## Teknik kaynaklar\n\n- [XML sitemap](${base}/sitemap.xml)\n- [RSS](${base}/feed/)\n\n## İçerik bilgisi\n\nBlog yazıları WordPress arşivinden eski URL'leri korunarak aktarılmıştır. İçeriği güncellenen sayfalar açıkça belirtilir. Sağlık içerikleri bilgilendirme amaçlıdır; kişisel tanı veya tedavi yerine geçmez.\n`;
await out("llms.txt", llms);
await out("llm.txt", llms);
const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>FootBalance Türkiye Blog</title><link>${base}/ayak-sagligi-hakkinda-bilgiler/</link><description>Ayak sağlığı ve kişiye özel ortopedik tabanlık rehberi</description><language>tr</language><atom:link href="${base}/feed/" rel="self" type="application/rss+xml"/>${index
  .filter((p) => p.language === "tr")
  .slice(0, 30)
  .map(
    (p) =>
      `<item><title>${xml(p.title)}</title><link>${xml(base + p.path)}</link><guid isPermaLink="true">${xml(base + p.path)}</guid><description>${xml(p.description)}</description><pubDate>${new Date(p.published).toUTCString()}</pubDate></item>`,
  )
  .join("")}</channel></rss>`;
await out("feed.xml", feed);
console.log(`Generated SEO files: ${urls.size} URLs, ${posts.length} posts.`);
