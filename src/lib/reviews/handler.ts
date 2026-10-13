const attempts = new Map<string, number>();

export async function handleGoogleReviews(request: Request, env: unknown): Promise<Response> {
  const json = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  if (request.method !== "GET")
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  const bindings = (env && typeof env === "object" ? env : {}) as Record<string, unknown>;
  const setting = (key: string) => String(bindings[key] ?? process.env[key] ?? "").trim();
  const key = setting("GOOGLE_PLACES_API_KEY");
  const placeId = setting("GOOGLE_PLACE_ID");
  if (!key || !placeId) return json({ available: false });
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local";
  const now = Date.now();
  for (const [address, expires] of attempts) if (expires <= now) attempts.delete(address);
  if (attempts.has(ip) || attempts.size >= 10000) return json({ available: false }, 429);
  attempts.set(ip, now + 30000);
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=tr`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "displayName,rating,userRatingCount,reviews,googleMapsUri,attributions",
        },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) return json({ available: false }, 502);
    const place = await response.json();
    return json({ available: true, place });
  } catch {
    return json({ available: false }, 502);
  }
}
