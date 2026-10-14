import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listLeads } from "../src/lib/leads/store.ts";
import assert from "node:assert/strict";
import { test, mock, after } from "node:test";
import nodemailer from "nodemailer";
import { requestSchema, todayInIstanbul } from "../src/lib/requests/schema.ts";
import { handleRequestSubmission } from "../src/lib/requests/handler.ts";
import { CENTERS } from "../src/data/centers.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "footbalance-requests-"));
after(() => rmSync(testDirectory, { recursive: true, force: true }));
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
const interview = {
  type: "interview",
  language: "tr",
  name: "Test Viewer",
  email: "viewer@example.test",
  phone: "+90 555 123 45 67",
  profession: "Fizyoterapist",
  consent: true,
};
test("interview requires profession, email, phone and explicit consent without partner fields", () => {
  assert.equal(requestSchema.safeParse(interview).success, true);
  for (const patch of [
    { profession: "" },
    { profession: "invalid" },
    { email: "" },
    { phone: "" },
    { consent: false },
    { website: "bot" },
  ])
    assert.equal(requestSchema.safeParse({ ...interview, ...patch }).success, false);
});

test("interview sends its own SMTP notification and preserves delivery failures", async () => {
  const env = {
    LEADS_DATA_DIR: testDirectory,
    SMTP_HOST: "smtp.example.test",
    SMTP_USER: "user",
    SMTP_PASSWORD: "secret",
    SMTP_FROM: "info@example.test",
    PARTNER_FORM_TO: "fallback@example.test",
    INTERVIEW_FORM_TO: "video@example.test",
  };
  let fail = false;
  const mocked = mock.method(nodemailer, "createTransport", () => ({
    sendMail: async (mail: Record<string, unknown>) => {
      assert.equal(mail.to, env.INTERVIEW_FORM_TO);
      assert.match(String(mail.subject), /Gül Baltacı/);
      assert.match(String(mail.text), /Fizyoterapist/);
      if (fail) throw new Error("SMTP unavailable");
      return { accepted: [env.INTERVIEW_FORM_TO], rejected: [] };
    },
    close() {},
  }));
  const submission = () => {
    const r = request(interview);
    r.headers.set("x-forwarded-for", "interview-test");
    return r;
  };
  try {
    assert.equal((await handleRequestSubmission(submission(), env)).status, 202);
    fail = true;
    assert.equal((await handleRequestSubmission(submission(), env)).status, 202);
    assert.equal(listLeads(env).at(-1)?.notification, "failed");
  } finally {
    mocked.mock.restore();
  }
});
function request(payload: unknown, origin = "https://footbalance.example.test") {
  return new Request("https://footbalance.example.test/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "x-forwarded-for": crypto.randomUUID(),
    },
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
      assert.equal(payload.type, "appointment");
      assert.equal(payload.language, "en");
      assert.ok(payload.submittedAt);
      return new Response(null, { status: 202 });
    };
    assert.equal((await handleRequestSubmission(request(appointment), env)).status, 202);
    globalThis.fetch = async () => new Response(null, { status: 500 });
    assert.equal((await handleRequestSubmission(request(appointment), env)).status, 502);
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

test("partner SMTP requires TLS and reports success only when recipient is accepted", async () => {
  const env = {
    LEADS_DATA_DIR: testDirectory,
    SMTP_HOST: "smtp.example.test",
    SMTP_PORT: "587",
    SMTP_USER: "user",
    SMTP_PASSWORD: "test-secret",
    SMTP_FROM: "info@example.test",
    PARTNER_FORM_TO: "recipient@example.test",
  };
  let accepted = true;
  let closed = 0;
  const mocked = mock.method(nodemailer, "createTransport", (options: Record<string, unknown>) => {
    assert.equal(options.requireTLS, true);
    assert.equal(options.secure, false);
    assert.equal(options.port, 587);
    return {
      sendMail: async (mail: Record<string, unknown>) => {
        assert.equal(mail.to, env.PARTNER_FORM_TO);
        assert.deepEqual(mail.replyTo, { name: partner.name, address: partner.email });
        assert.match(String(mail.text), /Test Clinic/);
        return {
          accepted: accepted ? [env.PARTNER_FORM_TO] : [],
          rejected: accepted ? [] : [env.PARTNER_FORM_TO],
        };
      },
      close: () => closed++,
    };
  });
  const smtpRequest = () => {
    const value = request(partner);
    value.headers.set("x-forwarded-for", "smtp-test");
    return value;
  };
  try {
    assert.equal((await handleRequestSubmission(smtpRequest(), env)).status, 202);
    accepted = false;
    assert.equal((await handleRequestSubmission(smtpRequest(), env)).status, 202);
    assert.equal(listLeads(env).at(-1)?.notification, "failed");
    assert.equal(closed, 2);
    assert.equal(
      (await handleRequestSubmission(smtpRequest(), { ...env, SMTP_PASSWORD: "" })).status,
      202,
    );
  } finally {
    mocked.mock.restore();
  }
});
