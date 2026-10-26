import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
const base = process.env.ADMIN_TEST_BASE_URL;
test(
  "admin authentication, CSRF, stable IDs, CRUD, visibility and stale edits",
  { skip: !base },
  async () => {
    const credentials = process.env.ADMIN_TEST_CREDENTIALS_FILE
      ? JSON.parse(await readFile(process.env.ADMIN_TEST_CREDENTIALS_FILE, "utf8"))
      : {
          admin_username: process.env.ADMIN_TEST_USERNAME,
          admin_password: process.env.ADMIN_TEST_PASSWORD,
        };
    const origin = process.env.ADMIN_PUBLIC_ORIGIN ?? new URL(base).origin;
    let cookie = "";
    async function get(path) {
      return fetch(base + path, { headers: { Cookie: cookie }, redirect: "manual" });
    }
    async function post(path, values, requestOrigin = origin) {
      const body = new URLSearchParams();
      for (const [key, value] of Object.entries(values))
        for (const entry of Array.isArray(value) ? value : [value]) body.append(key, entry);
      return fetch(base + path, {
        method: "POST",
        headers: {
          Cookie: cookie,
          Origin: requestOrigin,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        redirect: "manual",
      });
    }
    const hidden = (html, key) =>
      html
        .match(new RegExp(`name="${key}" value="([^"]*)"`))?.[1]
        ?.replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
    let response = await get("/admin");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("x-robots-tag"), /noindex/);
    assert.match(await response.text(), /Kullanıcı adı/);
    assert.equal((await post("/admin/save", {})).status, 401);
    assert.equal((await post("/admin/login", {}, "https://evil.example")).status, 403);
    assert.equal(
      (
        await post("/admin/login", {
          username: credentials.admin_username,
          password: "invalid-password",
        })
      ).status,
      401,
    );
    response = await post("/admin/login", {
      username: credentials.admin_username,
      password: credentials.admin_password,
    });
    assert.equal(response.status, 303);
    const setCookie = response.headers.get("set-cookie");
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    if (origin.startsWith("https:")) assert.match(setCookie, /Secure/);
    cookie = setCookie.split(";")[0];
    let html = await (await get("/admin")).text();
    assert.match(html, /select name="city"/);
    assert.equal(
      (html.match(/<tbody[^>]*>[\s\S]*?<\/tbody>/)?.[0].match(/<tr\b/g) ?? []).length,
      15,
    );
    assert.equal((html.match(/aria-label="Bayi listesi sayfaları"/g) ?? []).length, 1);
    assert.ok(html.indexOf('aria-label="Bayi listesi sayfaları"') > html.indexOf("</table>"));
    const secondPage = await (await get("/admin?page=2")).text();
    assert.doesNotMatch(secondPage, /LifeOn Concept Kadıköy/);
    assert.match(secondPage, /16–30 arası/);
    const searchedPage = await (await get("/admin?q=a")).text();
    assert.match(searchedPage, /q=a&amp;page=2/);
    assert.equal((await get("/admin?page=invalid")).status, 200);
    let filtered = await (await get("/admin?city=Adana")).text();
    assert.match(filtered, /AYSA Ayak Sağlığı/);
    assert.doesNotMatch(filtered, /LifeOn Concept Kadıköy/);
    filtered = await (await get("/admin?city=Adana&q=LifeOn")).text();
    assert.match(filtered, /0 hizmet noktası gösteriliyor/);
    const createForm = await (await get("/admin/new")).text();
    assert.match(createForm, /select name="city"/);
    assert.doesNotMatch(createForm, /name="main"/);
    assert.doesNotMatch(createForm, /name="sortOrder"/);
    assert.match(createForm, /id="add-phone"/);
    const csrf = hidden(html, "csrf");
    assert.ok(csrf);
    assert.equal((await post("/admin/save", { csrf: "invalid" })).status, 403);
    const orderMarker = `ORDER_TEST_${Date.now()}`;
    const fixtures = [];
    try {
      for (const suffix of ["A", "B"]) {
        assert.equal(
          (
            await post("/admin/save", {
              csrf,
              id: "",
              revision: "0",
              name: orderMarker + suffix,
              city: "Adana",
              person: "",
              phone: "",
              address: "Sıralama test adresi",
              email: "",
              site: "",
              maps: "",
              sortOrder: "99999",
            })
          ).status,
          303,
        );
      }
      let orderHtml = await (await get("/admin?q=" + orderMarker)).text();
      const original = JSON.parse(hidden(orderHtml, "original"));
      fixtures.push(...original);
      assert.equal(original.length, 2);
      const snapshot = hidden(orderHtml, "snapshot");
      const payload = {
        csrf,
        original: JSON.stringify(original),
        order: JSON.stringify([...original].reverse()),
        snapshot,
      };
      assert.equal(
        (
          await post("/admin/reorder", {
            ...payload,
            order: JSON.stringify([original[0], original[0]]),
          })
        ).status,
        400,
      );
      assert.equal((await post("/admin/reorder", { ...payload, csrf: "bad" })).status, 403);
      assert.equal((await post("/admin/reorder", payload)).status, 200);
      assert.equal((await post("/admin/reorder", payload)).status, 409);
      orderHtml = await (await get("/admin?q=" + orderMarker)).text();
      assert.deepEqual(JSON.parse(hidden(orderHtml, "original")), [...original].reverse());
      const globalHtml = await (await get("/admin?page=999999")).text();
      assert.ok(
        globalHtml.indexOf('data-id="' + original[1] + '"') <
          globalHtml.indexOf('data-id="' + original[0] + '"'),
      );
    } finally {
      for (const id of fixtures) {
        const edit = await (await get("/admin/edit?id=" + id)).text();
        assert.equal(
          (
            await post("/admin/delete", {
              csrf,
              id,
              revision: hidden(edit, "revision"),
              confirm: "yes",
            })
          ).status,
          303,
        );
      }
    }
    const marker = `ADMIN_TEST_${Date.now()}`;
    const values = {
      csrf,
      id: "",
      revision: "0",
      name: marker,
      person: "Test Yetkili",
      phone: ["0555 000 00 00", "0212 555 00 00"],
      address: "Test adres",
      email: "test@example.test",
      maps: "https://maps.google.com/",
      site: "https://example.test/",
      city: "Adana",
      sortOrder: "99999",
      active: "on",
    };
    response = await post("/admin/save", { ...values, site: "javascript:alert(1)" });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Bilgileri kontrol edin/);
    response = await post("/admin/save", { ...values, city: "Geçersiz şehir" });
    assert.match(await response.text(), /Bilgileri kontrol edin/);
    response = await post("/admin/save", { ...values, phone: ["12"] });
    assert.match(await response.text(), /Telefonları ayrı alanlara girin/);
    response = await post("/admin/save", { ...values, phone: Array(6).fill("0555 000 00 00") });
    assert.match(await response.text(), /Telefonları ayrı alanlara girin/);
    assert.equal((await post("/admin/save", values)).status, 303);
    html = await (await get("/admin?q=" + marker)).text();
    const id = html.match(/\/admin\/edit\?id=([a-f0-9]+)/)?.[1];
    assert.ok(id);
    let revision = "1";
    try {
      html = await (await get("/admin/edit?id=" + id)).text();
      assert.equal(hidden(html, "id"), id);
      assert.equal(hidden(html, "revision"), "1");
      assert.match(html, /value="0555 000 00 00"/);
      assert.match(html, /value="0212 555 00 00"/);
      assert.doesNotMatch(html, /name="sortOrder"/);
      assert.match(await (await get("/footbalance-hizmet-noktalari/")).text(), new RegExp(marker));
      const update = {
        ...values,
        id,
        revision,
        name: marker + "_UPDATED",
        phone: ["0555 000 00 00"],
      };
      delete update.active;
      assert.equal((await post("/admin/save", update)).status, 303);
      revision = "2";
      assert.equal((await post("/admin/save", update)).status, 409);
      assert.doesNotMatch(
        await (await get("/footbalance-hizmet-noktalari/")).text(),
        new RegExp(marker),
      );
      html = await (await get("/admin/edit?id=" + id)).text();
      assert.match(html, new RegExp(marker + "_UPDATED"));
      assert.equal(hidden(html, "revision"), "2");
      assert.doesNotMatch(html, /value="0212 555 00 00"/);
      assert.equal(
        (await post("/admin/delete", { csrf, id, revision, confirm: "yes" })).status,
        303,
      );
      revision = "";
      assert.equal((await get("/admin/edit?id=" + id)).status, 404);
    } finally {
      if (revision) await post("/admin/delete", { csrf, id, revision, confirm: "yes" });
      assert.equal((await post("/admin/logout", { csrf })).status, 303);
    }
    assert.match(await (await get("/admin")).text(), /Kullanıcı adı/);
  },
);
