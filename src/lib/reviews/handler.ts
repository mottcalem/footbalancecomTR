// Retired endpoint: keep old browser sessions from triggering paid Google requests.
export async function handleGoogleReviews(): Promise<Response> {
  return Response.json({ available: false }, { status: 410 });
}
