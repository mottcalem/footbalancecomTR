import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const base = process.env.SEO_TEST_BASE_URL ?? "http://127.0.0.1:8084";
// Independent fixture transcribed from the supplied 16 October 2026 workbook.
const expected = JSON.parse(
  await readFile(new URL("./redirects-2026-10-16.json", import.meta.url)),
);

for (const [source, destination] of expected) {
  test(`A4 ${source} returns one 301 to a canonical 200 destination`, async () => {
    for (const method of ["GET", "HEAD"]) {
      for (const path of [source, source.slice(0, -1)]) {
        const response = await fetch(`${base}${path}?utm_source=redirect-check`, {
          method,
          redirect: "manual",
        });
        assert.equal(response.status, 301, `${method} ${path}`);
        const target = new URL(response.headers.get("location"));
        if (destination.startsWith("https://")) {
          assert.equal(target.href, destination);
          await response.body?.cancel();
          continue;
        }
        assert.equal(target.pathname, destination);
        assert.equal(target.searchParams.get("utm_source"), "redirect-check");
        assert.equal(target.origin, new URL(base).origin);
        await response.body?.cancel();
      }
    }
    if (destination.startsWith("https://")) return;
    const final = await fetch(base + destination, { redirect: "manual" });
    assert.equal(final.status, 200, "destination must not add another redirect");
    const html = await final.text();
    assert.match(html, /<link[^>]*rel="canonical"[^>]*>/);
    assert.ok(html.includes(`href="https://footbalance.com.tr${destination}"`));
  });
}

test("Redirected articles stay out of discovery files and the archive data", async () => {
  const sources = expected.slice(3).map(([source]) => source);
  for (const path of ["sitemap.xml", "llms.txt", "llm.txt", "feed.xml"]) {
    const content = await readFile(new URL(`../public/${path}`, import.meta.url), "utf8");
    for (const source of sources)
      assert.ok(!content.includes(`https://footbalance.com.tr${source}`), `${path}: ${source}`);
  }
  const index = JSON.parse(await readFile(new URL("../src/data/blog-index.json", import.meta.url)));
  for (const source of sources) assert.ok(!index.some((post) => post.path === source));
  for (const [, destination] of expected
    .slice(3)
    .filter(
      ([, target]) =>
        (target.startsWith("/ayak-sagligi-") && target !== "/ayak-sagligi-hakkinda-bilgiler/") ||
        target.startsWith("/ortopedik-tabanliklar/"),
    ))
    assert.ok(index.some((post) => post.path === destination));
});
