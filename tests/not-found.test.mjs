import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const base = process.env.SEO_TEST_BASE_URL ?? "http://127.0.0.1:8086";
const popular = JSON.parse(
  await readFile(new URL("../src/data/popular-posts.json", import.meta.url)),
);
for (const [language, missing, archive] of [
  ["tr", "/missing-page-404-check/", "/ayak-sagligi-hakkinda-bilgiler/"],
  ["en", "/en/missing-page-404-check/", "/en/foot-health-blog/"],
]) {
  test(`${language}: real HTTP 404, one H1, native search and working popular links`, async () => {
    for (const method of ["GET", "HEAD"]) {
      const response = await fetch(base + missing, { method, redirect: "manual" });
      assert.equal(response.status, 404);
      assert.equal(response.headers.get("location"), null);
      if (method === "GET") {
        const body = await response.text();
        assert.equal((body.match(/<h1(?:\s|>)/gi) ?? []).length, 1);
        assert.ok(body.includes(`action="${archive}"`));
        assert.match(body, /<form[^>]*method="get"/);
        assert.match(body, /<input[^>]*name="q"/);
        for (const post of popular[language]) {
          assert.ok(body.includes(`href="${post.path}"`));
          const target = await fetch(base + post.path, { method: "HEAD", redirect: "manual" });
          assert.equal(target.status, 200, post.path);
        }
      }
    }
  });

  test(`${language}: submitted search is applied in server HTML and supports no results`, async () => {
    const term = language === "tr" ? "kompresyon" : "orthotic";
    const response = await fetch(`${base}${archive}?q=${term}`);
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.ok(body.includes(`value="${term}"`));
    assert.ok(
      !body.includes(
        language === "tr" ? "Aramanla eşleşen yazı bulunamadı." : "No articles match your search.",
      ),
    );
    const empty = await fetch(`${base}${archive}?q=unmatched404searchquery`);
    assert.equal(empty.status, 200);
    const emptyHtml = await empty.text();
    assert.ok(
      emptyHtml.includes(
        language === "tr" ? "Aramanla eşleşen yazı bulunamadı." : "No articles match your search.",
      ),
    );
    assert.equal((emptyHtml.match(/<h1(?:\s|>)/gi) ?? []).length, 1);
  });
}
