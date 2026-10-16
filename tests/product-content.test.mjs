import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { test } from "node:test";

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const catalogs = await read("../src/data/product-catalogs.json");
const details = await read("../src/data/product-pages.json");
const imports = await read("../src/data/imported-pages.json");
const pages = await read("../src/data/legacy-pages.json");
const redirects = await read("../src/data/legacy-redirects.json");
const base = process.env.SEO_TEST_BASE_URL ?? "http://127.0.0.1:8084";

test("Both source catalogs preserve all five groups and 30 complete product destinations", async () => {
  for (const path of ["/urunler/", "/en/products/"]) {
    assert.equal(catalogs[path].sections.length, 5);
    const products = catalogs[path].sections.flatMap((section) => section.products);
    assert.equal(products.length, 30);
    assert.equal(new Set(products.map((product) => product.path)).size, 30);
    for (const product of products) {
      assert.ok(details[product.path], `Missing product content: ${product.path}`);
      assert.ok(pages.some((page) => page.path === product.path));
      assert.ok(details[product.path].content.replace(/<[^>]+>/g, "").trim().length > 80);
      assert.ok(details[product.path].images.length > 0);
      await access(new URL(`../public${product.image}`, import.meta.url));
      for (const image of details[product.path].images)
        await access(new URL(`../public${image.src}`, import.meta.url));
    }
  }
});

test("Restored content is present in server HTML with one H1 and the established canonical", async () => {
  const audit = await read("../docs/content-recovery-audit.json");
  for (const path of [...Object.keys(catalogs), ...audit.restored]) {
    const response = await fetch(base + path, { redirect: "manual" });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(
      !html.includes("İçerik güncellenmektedir.") && !html.includes("Content is being updated."),
      path,
    );
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, path);
    assert.ok(html.includes(`href="https://footbalance.com.tr${path}"`), path);
    if (catalogs[path]) {
      for (const product of catalogs[path].sections.flatMap((section) => section.products)) {
        assert.ok(html.includes(`href="${product.path}"`), `${path}: product link ${product.path}`);
      }
    }
  }
});

test("Traffic-bearing existing page records cannot regress to empty placeholders", async () => {
  const source = await read("../docs/traffic-content-recovery-sources.json");
  for (const { path } of source.pages) {
    if (redirects[path.replace(/\/?$/, "/")] || path === "/en/") continue;
    assert.ok(
      pages.some((page) => page.path === path),
      `Missing traffic-bearing page: ${path}`,
    );
    assert.ok(
      catalogs[path] ||
        details[path] ||
        imports[path]?.content ||
        imports[path]?.testimonials?.length,
      path,
    );
  }
});
