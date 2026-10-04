import { requestSchema } from "./schema.ts";
import { CENTERS } from "../../data/centers.ts";

const attempts = new Map<string, { count: number; expires: number }>();
function setting(env: unknown, key: string): string | undefined {
  const bindings = env && typeof env === "object" ? (env as Record<string, unknown>) : {};
  const value = bindings[key] ?? process.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function json(status: number, code: string) {
  return Response.json(
    { ok: status === 202, code },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export async function handleRequestSubmission(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json(403, "INVALID_ORIGIN");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json(415, "INVALID_CONTENT_TYPE");
  if (Number(request.headers.get("content-length")) > 12000) return json(413, "TOO_LARGE");
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local";
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
  const entry = attempts.get(ip);
  if (entry && entry.count >= 10) return json(429, "TOO_MANY_REQUESTS");
  if (attempts.size < 1000 || entry)
    attempts.set(ip, { count: (entry?.count ?? 0) + 1, expires: entry?.expires ?? now + 60000 });
  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 12000) return json(413, "TOO_LARGE");
    payload = JSON.parse(body);
  } catch {
    return json(400, "INVALID_JSON");
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return json(400, "INVALID_FORM");
  const values = parsed.data;
  const selectedCenter =
    values.type === "appointment" && /^(0|[1-9]\d*)$/.test(values.center)
      ? CENTERS[Number(values.center)]
      : undefined;
  if (values.type === "appointment" && (!selectedCenter || selectedCenter.city !== values.city))
    return json(400, "INVALID_CENTER");
  const webhook = setting(env, "FORM_WEBHOOK_URL");
  if (!webhook) return json(503, "DELIVERY_UNAVAILABLE");
  try {
    if (new URL(webhook).protocol !== "https:") return json(503, "DELIVERY_UNAVAILABLE");
    const token = setting(env, "FORM_WEBHOOK_TOKEN");
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...values,
        ...(selectedCenter
          ? {
              centerId: values.center,
              center: selectedCenter.name,
              centerAddress: selectedCenter.address,
            }
          : {}),
        submittedAt: new Date().toISOString(),
        source: "footbalance-website",
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!response.ok) return json(502, "DELIVERY_FAILED");
    return json(202, "ACCEPTED");
  } catch {
    return json(502, "DELIVERY_FAILED");
  }
}
