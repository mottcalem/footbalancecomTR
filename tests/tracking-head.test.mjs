import assert from "node:assert/strict";
import { test } from "node:test";
const base = process.env.SEO_TEST_BASE_URL ?? "http://127.0.0.1:8084";
for (const path of ["/", "/urunler/", "/en/home/", "/missing-tracking-check/"]) {
  test(`Tracking scripts appear once in the shared head: ${path}`, async () => {
    const html = await (await fetch(base + path)).text();
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
    assert.ok(head);
    assert.match(head, /^\s*<script id="google-tag-manager"/);
    assert.equal((head.match(/id="google-tag-manager"/g) ?? []).length, 1);
    assert.equal((head.match(/id="meta-pixel"/g) ?? []).length, 1);
    assert.ok(head.includes("GTM-T4T2LQLH"));
    assert.ok(head.includes("fbq('init','258016955490147')"));
    assert.ok(head.includes("fbq('track','PageView')"));
    assert.match(html, /<body[^>]*><noscript><img[^>]*facebook\.com\/tr\?id=258016955490147/);
  });
}
