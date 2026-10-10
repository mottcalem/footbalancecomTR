import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const base = process.argv[2] ?? "http://localhost:8082";
const posts = JSON.parse(await readFile(new URL("../src/data/blog-posts.json", import.meta.url)));
const redirects = JSON.parse(
  await readFile(new URL("../src/data/legacy-redirects.json", import.meta.url)),
);
const pages = JSON.parse(await readFile(new URL("../src/data/legacy-pages.json", import.meta.url)));
const failures = [];
let completed = 0;
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c],
  );
const urls = [...pages, ...posts];
async function check(p) {
  try {
    const r = await fetch(base + p.path);
    assert.equal(r.status, 200, `${p.path}: HTTP ${r.status}`);
    const body = await r.text();
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
    assert.equal(new URL(r.headers.get("location")).pathname, expected);
  } catch (e) {
    failures.push(oldPath + ": " + e);
  }
}
const missing = await fetch(base + "/does-not-exist-seo-test/");
try {
  assert.equal(missing.status, 404);
} catch (e) {
  failures.push(String(e));
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
}
const report = { checked: completed, failures };
await writeFile(
  new URL("../docs/migration-verification.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
