import assert from "node:assert/strict";
import { test } from "node:test";
import { requestSchema, todayInIstanbul } from "../src/lib/requests/schema.ts";
import { handleRequestSubmission } from "../src/lib/requests/handler.ts";
import { CENTERS } from "../src/data/centers.ts";

const appointment = {
  type: "appointment",
  language: "en",
  name: "Test User",
  phone: "+90 555 123 45 67",
  email: "test@example.test",
  city: CENTERS[0]!.city,
  center: "0",
  consent: true,
};
const partner = {
  ...appointment,
  type: "partner",
  company: "Test Clinic",
  field: "Fizyoterapi Kliniği",
};
function request(payload: unknown, origin = "https://footbalance.example.test") {
  return new Request("https://footbalance.example.test/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(payload),
  });
}
test("requires contact details, consent and type-specific fields", () => {
  assert.equal(requestSchema.safeParse(appointment).success, true);
  assert.equal(requestSchema.safeParse(partner).success, true);
  for (const payload of [
    { ...appointment, consent: false },
    { ...appointment, phone: "abc" },
    { ...appointment, email: "invalid" },
    { ...appointment, center: "" },
    { ...partner, company: "" },
    { ...partner, field: "invalid" },
    { ...appointment, website: "bot" },
    { ...appointment, preferredDate: "2020-01-01" },
    { ...appointment, preferredDate: "2099-02-31" },
  ])
    assert.equal(requestSchema.safeParse(payload).success, false);
  assert.equal(
    requestSchema.safeParse({ ...appointment, preferredDate: todayInIstanbul() }).success,
    true,
  );
});
test("never reports success without a delivery service; validates origin and center", async () => {
  const disabled = { FORM_WEBHOOK_URL: "" };
  assert.equal((await handleRequestSubmission(request(appointment), disabled)).status, 503);
  assert.equal(
    (await handleRequestSubmission(request({ ...appointment, consent: false }), disabled)).status,
    400,
  );
  assert.equal(
    (await handleRequestSubmission(request({ ...appointment, city: "unknown" }), disabled)).status,
    400,
  );
  assert.equal(
    (await handleRequestSubmission(request(appointment, "https://other.example.test"), disabled))
      .status,
    403,
  );
});
test("reports acceptance only after delivery succeeds, and preserves failures", async () => {
  const originalFetch = globalThis.fetch;
  const env = {
    FORM_WEBHOOK_URL: "https://forms.example.test/requests",
    FORM_WEBHOOK_TOKEN: "test-token",
  };
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, env.FORM_WEBHOOK_URL);
      assert.equal(
        (options?.headers as Record<string, string>)["Authorization"],
        "Bearer test-token",
      );
      const payload = JSON.parse(String(options?.body));
      assert.equal(payload.type, "partner");
      assert.equal(payload.language, "en");
      assert.ok(payload.submittedAt);
      return new Response(null, { status: 202 });
    };
    assert.equal((await handleRequestSubmission(request(partner), env)).status, 202);
    globalThis.fetch = async () => new Response(null, { status: 500 });
    assert.equal((await handleRequestSubmission(request(partner), env)).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("accepts optional appointment email and exact time preferences", () => {
  assert.equal(
    requestSchema.safeParse({ ...appointment, email: "", preferredTime: "11:30" }).success,
    true,
  );
  assert.equal(requestSchema.safeParse({ ...partner, email: "" }).success, false);
  assert.equal(requestSchema.safeParse({ ...appointment, preferredTime: "25:00" }).success, false);
});
