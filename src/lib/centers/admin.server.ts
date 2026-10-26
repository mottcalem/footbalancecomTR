import { centerPhones } from "./phones.ts";
import { PHONE_CLIENT } from "./phone-client";
import { orderingSnapshot, reorderCenters } from "./order.server.ts";
import { SORT_CLIENT } from "./sort-client";
import { cityChoices } from "./cities.ts";
import { randomBytes, createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { database, listCenters } from "./store.server.ts";
import { centerSchema, type ManagedCenter } from "./schema.ts";

const cookieName = "fb_admin_session";
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};
function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)} | FootBalance Yönetim</title><style>
*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;background:#f3f7f8;color:#103c4c;font:15px/1.5 system-ui,sans-serif}header{background:#073b4b;color:white;padding:22px max(24px,calc((100vw - 1200px)/2));display:flex;align-items:center;justify-content:space-between;gap:20px}header a{color:white}header strong{font-size:22px}main{max-width:1200px;margin:36px auto;padding:0 24px}h1{font-size:30px;letter-spacing:-1px;margin:0 0 8px}h2{font-size:20px}a{color:#007f80}button,.button{display:inline-block;background:#008d88;border:0;border-radius:9px;color:white;padding:11px 18px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none}button:hover,.button:hover{background:#006e70}button:disabled{opacity:.5}.danger{background:#b42335}.secondary{background:#e3edef;color:#103c4c}input:not([type=checkbox]),textarea,select{width:100%;padding:12px;border:1px solid #b8ced3;border-radius:8px;font:inherit;background:white;color:#103c4c}input:focus,textarea:focus,select:focus{outline:2px solid #008d88;outline-offset:2px}label{display:block;font-weight:600}label span{display:block;margin-bottom:6px}textarea{min-height:100px}.panel{background:white;padding:26px;border:1px solid #d7e3e6;border-radius:16px;box-shadow:0 3px 14px #073b4b06}.login{max-width:440px;margin:70px auto}.phone-fieldset{min-width:0;margin:0;padding:0;border:0}.phone-fieldset legend{font-weight:600;margin-bottom:6px}.phone-row{display:flex;align-items:end;gap:8px;margin-bottom:10px}.phone-row label{flex:1;min-width:0}.phone-row label span{font-size:12px;color:#607b85}.phone-row button{padding:12px}.phone-number{display:block}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.full{grid-column:1/-1}.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:24px}.muted{color:#607b85}.notice{padding:14px 18px;border-radius:9px;background:#e0f4ed;margin:18px 0}.error{background:#ffe8e8;color:#9b2030}.toolbar{display:flex;justify-content:space-between;gap:18px;align-items:center;margin:26px 0}.search{display:flex;gap:10px;flex:1;max-width:850px;flex-wrap:wrap}.search input{flex:2;min-width:200px}.search select{flex:1;min-width:180px;width:auto}.pagination{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:20px 0}.pagination .button{padding:9px 14px}.sort-handle{background:transparent;color:#607b85;cursor:grab;touch-action:none;padding:6px 10px;font-size:22px}.sort-handle:hover{background:#e3edef;color:#103c4c}.sort-handle:focus-visible{outline:2px solid #008d88}.sorting{background:#e0f4ed}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.order-tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0}.order-tools p{width:100%;margin:0}.table{overflow:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;background:#edf4f5}td,th{padding:16px;border-bottom:1px solid #e2ecee;vertical-align:top}td small{display:block;color:#607b85;margin-top:4px}.badge{display:inline-block;padding:3px 9px;border-radius:20px;background:#e0f4ed;font-size:12px;white-space:nowrap}.off{background:#f3e8e8;color:#93404a}.check{display:flex;gap:10px;align-items:center}.empty{padding:36px;text-align:center}footer{padding:24px;color:#607b85;font-size:13px}@media(max-width:700px){.grid{grid-template-columns:1fr}.toolbar{align-items:stretch;flex-direction:column}header{padding:18px 24px}main{margin-top:24px}h1{font-size:25px}.panel{padding:20px}td,th{padding:12px}}
</style></head><body><header><strong>FootBalance <small>Yönetim</small></strong><a href="/" target="_blank" rel="noopener">Siteyi görüntüle ↗</a></header><main>${body}</main><footer>FootBalance Türkiye · Hizmet noktaları yönetimi</footer></body></html>`,
    { status, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } },
  );
}
function redirect(path: string, cookie?: string) {
  return new Response(null, {
    status: 303,
    headers: { ...headers, Location: path, ...(cookie ? { "Set-Cookie": cookie } : {}) },
  });
}
function setCookie(value: string, maxAge: number, secure: boolean) {
  return `${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
function login(error = "", status = 200) {
  return page(
    "Giriş",
    `<section class="panel login"><p class="muted">YÖNETİCİ GİRİŞİ</p><h1>Hoş geldiniz</h1><p class="muted">Hizmet noktalarını yönetmek için giriş yapın.</p>${error ? `<p role="alert" class="notice error">${esc(error)}</p>` : ""}<form method="post" action="/admin/login"><label><span>Kullanıcı adı</span><input name="username" required autocomplete="username" maxlength="100"></label><label style="margin-top:18px"><span>Şifre</span><input type="password" name="password" required autocomplete="current-password" maxlength="256"></label><button style="width:100%;margin-top:24px">Giriş yap</button></form></section>`,
    status,
  );
}
async function session(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return undefined;
  const result = await database().query<{ token_hash: string; csrf: string }>(
    "SELECT token_hash, csrf FROM admin_sessions WHERE token_hash=$1 AND expires_at > now()",
    [digest(token)],
  );
  return result.rows[0];
}
const hidden = (name: string, value: string | number) =>
  `<input type="hidden" name="${name}" value="${esc(value)}">`;
function citySelect(cities: string[], selected: string, placeholder: string, required = false) {
  return `<select name="city" aria-label="${required ? "Şehir / Bölge" : "Şehre göre filtrele"}" ${required ? "required" : ""}><option value="">${placeholder}</option>${cities.map((city) => `<option value="${esc(city)}" ${city === selected ? "selected" : ""}>${esc(city)}</option>`).join("")}</select>`;
}
async function editor(c: Partial<ManagedCenter>, csrf: string, error = "") {
  const cities = cityChoices(await listCenters(true));
  const input = (name: keyof ManagedCenter, label: string, required = false, type = "text") =>
    `<label><span>${label}${required ? " *" : ""}</span><input type="${type}" name="${name}" value="${esc(c[name])}" ${required ? "required" : ""} maxlength="${["maps", "site"].includes(name) ? 2000 : 254}" ${type === "number" ? 'min="0" max="100000" step="1"' : ""}></label>`;
  const phoneRow = (number: string, index: number) =>
    `<div class="phone-row"><label><span>Telefon ${index + 1}</span><input type="tel" name="phone" value="${esc(number)}" maxlength="80" autocomplete="tel"></label><button type="button" class="secondary" data-remove-phone aria-label="Telefon ${index + 1} alanını kaldır">Kaldır</button></div>`;
  const numbers = centerPhones(c.phone ?? "");
  const phoneFields = `<fieldset class="phone-fieldset"><legend>Telefon</legend><div id="phone-inputs">${(numbers.length ? numbers : [""]).map(phoneRow).join("")}</div><button type="button" class="secondary" id="add-phone">+ Numara ekle</button><template id="phone-template">${phoneRow("", 0)}</template></fieldset>`;
  return page(
    c.id ? "Hizmet noktasını düzenle" : "Yeni hizmet noktası",
    `<a href="/admin">← Hizmet noktaları</a><h1 style="margin-top:20px">${c.id ? "Hizmet noktasını düzenle" : "Yeni hizmet noktası"}</h1><p class="muted">Kaydettiğiniz bilgiler web sitesine ve randevu seçimlerine yansır.</p>${error ? `<p class="notice error" role="alert">${esc(error)}</p>` : ""}<section class="panel"><form method="post" action="/admin/save">${hidden("csrf", csrf)}${hidden("id", c.id ?? "")}${hidden("revision", c.revision ?? 0)}<div class="grid">${input("name", "Hizmet noktası adı", true)}<label><span>Şehir / Bölge *</span>${citySelect(cities, c.city ?? "", "Şehir / Bölge seçin", true)}</label>${input("person", "Yetkili kişi")}${phoneFields}<label class="full"><span>Adres *</span><textarea name="address" maxlength="1000" required>${esc(c.address)}</textarea></label>${input("email", "E-posta", false, "email")}${input("site", "Web sitesi", false, "url")}${input("maps", "Google Haritalar / Yol tarifi bağlantısı", false, "url")}<label class="check"><input type="checkbox" name="active" ${c.active !== false ? "checked" : ""}> Yayında</label></div><div class="actions"><button>Değişiklikleri kaydet</button><a class="button secondary" href="/admin">Vazgeç</a></div></form></section>${c.id ? `<section class="panel" style="margin-top:24px"><h2>Hizmet noktasını sil</h2><p class="muted">Geçici olarak gizlemek için “Yayında” seçimini kaldırabilirsiniz. Silme işlemi geri alınamaz.</p><form method="post" action="/admin/delete">${hidden("csrf", csrf)}${hidden("id", c.id)}${hidden("revision", c.revision ?? 0)}<label class="check"><input name="confirm" type="checkbox" required value="yes"> Bu hizmet noktasını kalıcı olarak silmek istiyorum.</label><button class="danger" style="margin-top:16px">Hizmet noktasını sil</button></form></section>` : ""}<script src="/admin/phones.js" defer></script>`,
  );
}
export async function handleAdmin(request: Request): Promise<Response> {
  if (
    !process.env["DATABASE_URL"] ||
    !process.env["ADMIN_PASSWORD_HASH"] ||
    !process.env["ADMIN_USERNAME"]
  )
    return page("Yapılandırma gerekli", "<h1>Yönetim paneli henüz yapılandırılmadı.</h1>", 503);
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const origin = process.env["ADMIN_PUBLIC_ORIGIN"] ?? url.origin;
  const secure = origin.startsWith("https:");
  if (!["GET", "POST"].includes(request.method))
    return new Response(null, { status: 405, headers: { ...headers, Allow: "GET, POST" } });
  let form = new URLSearchParams();
  if (request.method === "POST") {
    if (request.headers.get("origin") !== origin)
      return page("Erişim reddedildi", "<h1>İstek kaynağı doğrulanamadı.</h1>", 403);
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
      return page("Geçersiz istek", "<h1>Geçersiz istek.</h1>", 415);
    if (Number(request.headers.get("content-length")) > 20000)
      return page("Geçersiz istek", "<h1>İstek çok büyük.</h1>", 413);
    const body = await request.text();
    if (body.length > 20000) return page("Geçersiz istek", "<h1>İstek çok büyük.</h1>", 413);
    form = new URLSearchParams(body);
  }
  if (path === "/admin/login" && request.method === "POST") {
    const { rows } = await database().query<{ count: number }>(
      `INSERT INTO admin_login_attempts (id,count,expires_at) VALUES (1,1,now()+interval '15 minutes') ON CONFLICT (id) DO UPDATE SET count=CASE WHEN admin_login_attempts.expires_at < now() THEN 1 ELSE admin_login_attempts.count+1 END, expires_at=CASE WHEN admin_login_attempts.expires_at < now() THEN now()+interval '15 minutes' ELSE admin_login_attempts.expires_at END RETURNING count`,
    );
    if ((rows[0]?.count ?? 100) > 10)
      return login("Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.", 429);
    const [salt, hash] = process.env["ADMIN_PASSWORD_HASH"].split(":");
    const password = form.get("password") ?? "";
    const candidate = scryptSync(password.slice(0, 256), salt ?? "", 64);
    const expected = Buffer.from(hash ?? "", "hex");
    if (
      form.get("username") !== process.env["ADMIN_USERNAME"] ||
      password.length > 256 ||
      expected.length !== candidate.length ||
      !timingSafeEqual(expected, candidate)
    )
      return login("Kullanıcı adı veya şifre hatalı.", 401);
    const token = randomBytes(32).toString("hex");
    await database().query("DELETE FROM admin_sessions WHERE expires_at < now()");
    await database().query(
      "INSERT INTO admin_sessions(token_hash,csrf,expires_at) VALUES ($1,$2,now()+interval '8 hours')",
      [digest(token), randomBytes(32).toString("hex")],
    );
    await database().query("DELETE FROM admin_login_attempts WHERE id=1");
    return redirect("/admin", setCookie(token, 28800, secure));
  }
  const auth = await session(request);
  if (!auth)
    return request.method === "GET"
      ? login()
      : login("Oturumunuz sona erdi. Tekrar giriş yapın.", 401);
  if (path === "/admin/phones.js" && request.method === "GET")
    return new Response(PHONE_CLIENT, {
      headers: { ...headers, "Content-Type": "application/javascript; charset=utf-8" },
    });
  if (path === "/admin/reorder.js" && request.method === "GET")
    return new Response(SORT_CLIENT, {
      headers: { ...headers, "Content-Type": "application/javascript; charset=utf-8" },
    });
  if (request.method === "POST") {
    if (form.get("csrf") !== auth.csrf)
      return page(
        "Erişim reddedildi",
        '<h1>Güvenlik doğrulaması başarısız.</h1><a href="/admin">Yeniden aç</a>',
        403,
      );
    if (path === "/admin/reorder") {
      let original: unknown, order: unknown;
      try {
        original = JSON.parse(form.get("original") ?? "");
        order = JSON.parse(form.get("order") ?? "");
      } catch {
        return Response.json({ ok: false }, { status: 400, headers });
      }
      if (
        !Array.isArray(original) ||
        !Array.isArray(order) ||
        !original.every((id) => typeof id === "string") ||
        !order.every((id) => typeof id === "string")
      )
        return Response.json({ ok: false }, { status: 400, headers });
      const status = await reorderCenters(original, order, form.get("snapshot") ?? "");
      return Response.json({ ok: status === 200 }, { status, headers });
    }
    if (path === "/admin/logout") {
      await database().query("DELETE FROM admin_sessions WHERE token_hash=$1", [auth.token_hash]);
      return redirect("/admin", setCookie("", 0, secure));
    }
    if (path === "/admin/save") {
      const input = {
        ...Object.fromEntries(form),
        active: form.has("active"),
        main: false,
        sortOrder: 0,
        phone: form
          .getAll("phone")
          .map((number) => number.trim())
          .filter(Boolean)
          .join("\n"),
      };
      const parsed = centerSchema.safeParse(input);
      const id = form.get("id") ?? "";
      const revision = Number(form.get("revision"));
      if (!parsed.success || !cityChoices(await listCenters(true)).includes(form.get("city") ?? ""))
        return editor(
          { ...input, id, revision } as Partial<ManagedCenter>,
          auth.csrf,
          "Bilgileri kontrol edin. Ad, adres ve telefon bilgilerini kontrol edin; şehri listeden seçin. Telefonları ayrı alanlara girin. Bağlantılar http/https ile başlamalıdır.",
        );
      if (id) {
        const result = await database().query(
          "UPDATE service_centers SET data=$1::jsonb || jsonb_build_object('main', data->'main', 'sortOrder', data->'sortOrder'), revision=revision+1, updated_at=now() WHERE id=$2 AND revision=$3",
          [parsed.data, id, revision],
        );
        if (!result.rowCount)
          return page(
            "Kayıt değişti",
            '<h1>Bu kayıt başka bir işlemde değiştirildi veya silindi.</h1><a href="/admin">Listeyi yenile</a>',
            409,
          );
      } else {
        await database().query(
          "INSERT INTO service_centers(id,data) SELECT $1,$2::jsonb || jsonb_build_object('sortOrder', COALESCE(MAX((data->>'sortOrder')::int),-1)+1) FROM service_centers",
          [randomBytes(16).toString("hex"), parsed.data],
        );
      }
      return redirect("/admin?saved=1");
    }
    if (path === "/admin/delete" && form.get("confirm") === "yes") {
      const result = await database().query(
        "DELETE FROM service_centers WHERE id=$1 AND revision=$2",
        [form.get("id"), Number(form.get("revision"))],
      );
      if (!result.rowCount)
        return page(
          "Kayıt değişti",
          '<h1>Kayıt değişti. Listeyi yenileyip tekrar deneyin.</h1><a href="/admin">Listeye dön</a>',
          409,
        );
      return redirect("/admin?deleted=1");
    }
    return page("Bulunamadı", "<h1>İşlem bulunamadı.</h1>", 404);
  }
  if (path === "/admin/new") return editor({ active: true, sortOrder: 1000 }, auth.csrf);
  const all = await listCenters(true);
  if (path === "/admin/edit") {
    const c = all.find((c) => c.id === url.searchParams.get("id"));
    return c
      ? editor(c, auth.csrf)
      : page(
          "Bulunamadı",
          '<h1>Hizmet noktası bulunamadı.</h1><a href="/admin">Listeye dön</a>',
          404,
        );
  }
  if (path !== "/admin") return page("Bulunamadı", "<h1>Sayfa bulunamadı.</h1>", 404);
  const q = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase("tr-TR");
  const city = url.searchParams.get("city") ?? "";
  const cities = [...new Set(all.map((c) => c.city))].sort((a, b) => a.localeCompare(b, "tr"));
  const list = all.filter(
    (c) =>
      (!city || c.city === city) &&
      [c.name, c.city, c.person, c.address].some((v) => v.toLocaleLowerCase("tr-TR").includes(q)),
  );

  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const currentPage = Number.isSafeInteger(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1;
  const offset = (currentPage - 1) * pageSize;
  const visible = list.slice(offset, offset + pageSize);
  const pageLink = (number: number, label: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", url.searchParams.get("q") ?? "");
    if (city) params.set("city", city);
    params.set("page", String(number));
    return `<a class="button ${number === currentPage ? "" : "secondary"}" ${number === currentPage ? 'aria-current="page"' : ""} href="/admin?${esc(params.toString())}">${label}</a>`;
  };
  const pagination =
    totalPages > 1
      ? `<nav class="pagination" aria-label="Bayi listesi sayfaları">${currentPage > 1 ? pageLink(currentPage - 1, "← Önceki") : ""}${Array.from({ length: totalPages }, (_, i) => pageLink(i + 1, String(i + 1))).join("")}${currentPage < totalPages ? pageLink(currentPage + 1, "Sonraki →") : ""}</nav>`
      : "";
  return page(
    "Hizmet noktaları",
    `<div class="toolbar"><div><h1>Hizmet noktaları</h1><p class="muted">${all.length} kayıt · ${all.filter((c) => c.active).length} yayında</p></div><form method="post" action="/admin/logout">${hidden("csrf", auth.csrf)}<button class="secondary">Çıkış yap</button></form></div>${url.searchParams.has("saved") ? '<p class="notice" role="status">Değişiklikler kaydedildi ve sitede yayına alındı.</p>' : ""}${url.searchParams.has("deleted") ? '<p class="notice" role="status">Hizmet noktası silindi.</p>' : ""}<div class="toolbar"><form class="search" method="get" action="/admin"><input aria-label="Hizmet noktası ara" name="q" value="${esc(url.searchParams.get("q") ?? "")}" placeholder="Hizmet noktası, şehir veya yetkili ara…">${citySelect(cities, city, "Tüm şehirler")}<button>Filtrele</button>${q || city ? '<a class="button secondary" href="/admin">Temizle</a>' : ""}</form><a class="button" href="/admin/new">+ Hizmet noktası ekle</a></div><p class="sr-only" role="status">${list.length} hizmet noktası gösteriliyor.${list.length ? ` ${offset + 1}–${offset + visible.length} arası · Sayfa ${currentPage} / ${totalPages}` : ""}</p>${url.searchParams.has("reordered") ? '<p class="notice" role="status">Sıralama kaydedildi ve sitede güncellendi.</p>' : ""}${visible.length > 1 ? `<form id="center-order" class="order-tools" method="post" action="/admin/reorder">${hidden("csrf", auth.csrf)}${hidden("snapshot", orderingSnapshot(all))}${hidden("original", JSON.stringify(visible.map((c) => c.id)))}<p class="sr-only">Sıralamak için ⋮⋮ tutamacını sürükleyin veya odaktayken ↑ / ↓ tuşlarını kullanın. Bu sayfadaki kayıtların sırası değişir.</p><button type="submit" disabled>Sıralamayı kaydet</button><button type="button" id="reset-order" class="secondary" hidden>Değişiklikleri iptal et</button><p id="order-status" role="status" aria-live="polite"></p></form>` : ""}<section class="panel table"><table><thead><tr><th aria-label="Sıralama">Sıra</th><th>Hizmet noktası / Yetkili</th><th>Şehir</th><th>İletişim</th><th>Durum</th><th>İşlem</th></tr></thead><tbody id="center-rows">${visible
      .map(
        (c) =>
          `<tr data-id="${esc(c.id)}"><td>${visible.length > 1 ? `<button type="button" class="sort-handle" data-sort-handle aria-label="${esc(c.name)} sırasını değiştir" title="Sürükleyin veya ↑ / ↓ tuşlarını kullanın">⋮⋮</button>` : ""}</td><td><strong>${esc(c.name)}</strong><small>${esc(c.person)}</small>${c.main ? '<span class="badge">Ana merkez</span>' : ""}</td><td>${esc(c.city)}</td><td>${centerPhones(
            c.phone,
          )
            .map((number) => `<span class="phone-number">${esc(number)}</span>`)
            .join(
              "",
            )}<small>${esc(c.email)}</small></td><td><span class="badge ${c.active ? "" : "off"}">${c.active ? "Yayında" : "Gizli"}</span></td><td><a href="/admin/edit?id=${encodeURIComponent(c.id)}">Düzenle</a></td></tr>`,
      )
      .join(
        "",
      )}</tbody></table>${!list.length ? '<p class="empty">Aramanızla eşleşen hizmet noktası bulunamadı.</p>' : ""}</section>${pagination}${visible.length > 1 ? '<script src="/admin/reorder.js" defer></script>' : ""}`,
  );
}
