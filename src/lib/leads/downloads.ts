import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDirectory } from "./store.ts";
import { setting } from "./settings.ts";
import { LEAD_FILES } from "./workbooks.ts";

type LeadType = keyof typeof LEAD_FILES;
function signature(env: unknown, period: string, type: string, expires: string) {
  const secret = setting(env, "LEADS_DOWNLOAD_SECRET");
  if (!secret || secret.length < 32)
    throw new Error("LEADS_DOWNLOAD_SECRET must be at least 32 characters");
  return createHmac("sha256", secret).update(`${period}|${type}|${expires}`).digest("hex");
}
export function downloadUrl(env: unknown, period: string, type: LeadType, now = new Date()) {
  const base = setting(env, "LEADS_REPORT_BASE_URL");
  if (!base || new URL(base).protocol !== "https:")
    throw new Error("LEADS_REPORT_BASE_URL must use HTTPS");
  const expires = String(Math.floor(now.getTime() / 1000) + 7 * 86400);
  const url = new URL(`/api/lead-reports/${period}/${type}`, base);
  url.searchParams.set("expires", expires);
  url.searchParams.set("signature", signature(env, period, type, expires));
  return url.href;
}
export async function saveReportFile(env: unknown, period: string, type: LeadType, buffer: Buffer) {
  const directory = join(dataDirectory(env), "reports", period);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const target = join(directory, LEAD_FILES[type]);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, buffer, { mode: 0o600 });
  await rename(temporary, target);
}
export async function handleLeadDownload(request: Request, env: unknown, now = new Date()) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  };
  const reject = (status: number) => new Response(null, { status, headers });
  if (request.method !== "GET" && request.method !== "HEAD")
    return new Response(null, { status: 405, headers: { ...headers, Allow: "GET, HEAD" } });
  const url = new URL(request.url);
  const match = /^\/api\/lead-reports\/(\d{4}-\d{2}-\d{2})\/(partner|interview)$/.exec(
    url.pathname,
  );
  const expires = url.searchParams.get("expires") ?? "";
  const supplied = url.searchParams.get("signature") ?? "";
  if (
    !match ||
    !/^\d{10}$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(supplied) ||
    Number(expires) <= Math.floor(now.getTime() / 1000)
  )
    return reject(403);
  const period = match[1]!;
  const type = match[2] as LeadType;
  let expected;
  try {
    expected = signature(env, period, type, expires);
  } catch {
    return reject(503);
  }
  if (!timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex")))
    return reject(403);
  try {
    const bytes = await readFile(join(dataDirectory(env), "reports", period, LEAD_FILES[type]));
    return new Response(request.method === "HEAD" ? null : new Uint8Array(bytes), {
      headers: {
        ...headers,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${period}-${LEAD_FILES[type]}"`,
        "Content-Length": String(bytes.length),
      },
    });
  } catch (error) {
    return reject((error as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 503);
  }
}
