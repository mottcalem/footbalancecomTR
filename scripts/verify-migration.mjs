import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const base = process.argv[2] ?? "http://localhost:8082";
const posts = JSON.parse(await readFile(new URL("../src/data/blog-posts.json", import.meta.url)));
const redirects = JSON.parse(
  await readFile(new URL("../src/data/legacy-redirects.json", import.meta.url)),
);
const pages = JSON.parse(await readFile(new URL("../src/data/legacy-pages.json", import.meta.url)));
const failures = [];
const headingChecks = [];
let completed = 0;
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c],
  );
const publicPathSource = await readFile(
  new URL("../src/lib/i18n/urls.ts", import.meta.url),
  "utf8",
);
const publicPaths = [...publicPathSource.matchAll(/\b(?:tr|en):\s*"([^"]+)"/g)].map(
  (match) => match[1],
);
const urls = [
  ...new Map(
    [
      ...pages,
      ...posts,
      ...publicPaths
        .filter((path) => ![...pages, ...posts].some((p) => p.path === path))
        .map((path) => ({ path })),
    ]
      .filter((p) => !redirects[p.path])
      .map((p) => [p.path, p]),
  ).values(),
];
function checkH1(path, html) {
  // Script payloads and comments can contain markup strings that are not headings.
  const markup = html.replace(
    /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,
    "",
  );
  const count = [...markup.matchAll(/<h1(?=[\s/>])/gi)].length;
  headingChecks.push({ path, count });
  assert.equal(count, 1, `${path}: expected one H1, found ${count}`);
}
async function check(p) {
  try {
    const r = await fetch(base + p.path);
    assert.equal(r.status, 200, `${p.path}: HTTP ${r.status}`);
    const body = await r.text();
    checkH1(p.path, body);
    assert.match(body, /<title>[^<]+<\/title>/);
    assert.match(body, /<meta[^>]*name="description"[^>]*content="[^"]+"/);
    assert.ok(
      body.includes(`href="https://footbalance.com.tr${p.path}"`),
      `${p.path}: canonical absent`,
    );
    if (p.content) assert.ok(body.includes(escape(p.title)), `${p.path}: article title absent`);
    assert.ok(!body.includes("face--satisfiedtype-patternshop"), "SVG title contamination");
  } catch (e) {
    failures.push(String(e));
  }
  completed++;
  if (completed % 40 === 0) console.log("Verified", completed, "/", urls.length);
}
let cursor = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < urls.length) await check(urls[cursor++]);
  }),
);
for (const [oldPath, expected] of Object.entries({
  ...redirects,
  "/merkezler": "/footbalance-hizmet-noktalari/",
  "/randevu": "/ucretsiz-ayak-analizi/",
  "/iletisim": "/bize-ulasin/",
  "/en": "/en/home/",
  "/en/hakkimizda": "/en/about-us/",
})) {
  const r = await fetch(base + oldPath, { redirect: "manual" });
  try {
    assert.equal(r.status, 301);
    assert.equal(new URL(r.headers.get("location")).href, new URL(expected, base).href);
  } catch (e) {
    failures.push(oldPath + ": " + e);
  } finally {
    await r.body?.cancel();
  }
}
for (const path of ["/does-not-exist-seo-test/", "/en/does-not-exist-seo-test/"]) {
  const missing = await fetch(base + path);
  try {
    assert.equal(missing.status, 404);
    checkH1(path, await missing.text());
  } catch (e) {
    failures.push(path + ": " + e);
  }
}
for (const file of [
  "sitemap.xml",
  "sitemap_index.xml",
  "robots.txt",
  "llm.txt",
  "llms.txt",
  "feed.xml",
]) {
  const r = await fetch(base + "/" + file);
  if (r.status !== 200) failures.push(file + ": " + r.status);
  await r.body?.cancel();
}
await writeFile(
  new URL("../docs/h1-verification.json", import.meta.url),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      base,
      checked: headingChecks.length,
      failures: headingChecks.filter((page) => page.count !== 1),
      pages: headingChecks,
    },
    null,
    2,
  ) + "\n",
);
const report = { checked: completed, h1Checked: headingChecks.length, failures };
await writeFile(
  new URL("../docs/migration-verification.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
