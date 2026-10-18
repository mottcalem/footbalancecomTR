import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nodemailer from "nodemailer";
import {
  partnerConfirmation,
  sendPartnerConfirmation,
} from "../src/lib/leads/partner-confirmation.ts";
import { requestSchema } from "../src/lib/requests/schema.ts";
import { saveLead } from "../src/lib/leads/store.ts";

test("partner confirmation uses the submission language and escapes the applicant name", () => {
  const tr = partnerConfirmation("A <B>", "tr");
  assert.match(tr.text, /Başvurunuzu aldık, değerlendiriyoruz/);
  assert.match(tr.html, /A &lt;B&gt;/);
  assert.match(tr.html, /lang="tr"/);
  const en = partnerConfirmation("Test User", "en");
  assert.match(en.text, /received your application and are reviewing it/);
  assert.match(en.html, /lang="en"/);
});
test("failed receipt can be retried; successful and concurrent receipts are deduplicated", async () => {
  const directory = mkdtempSync(join(tmpdir(), "partner-receipt-"));
  const env = {
    LEADS_DATA_DIR: directory,
    SMTP_HOST: "smtp.example.test",
    SMTP_USER: "user",
    SMTP_PASSWORD: "secret",
    SMTP_FROM: "info@example.test",
    PARTNER_FORM_TO: "office@example.test",
  };
  const values = requestSchema.parse({
    type: "partner",
    language: "tr",
    name: "Test User",
    email: "applicant@example.test",
    phone: "0212 325 88 51",
    city: "İstanbul",
    company: "Test Clinic",
    field: "Diğer",
    consent: true,
  });
  const { lead } = saveLead(env, values);
  let calls = 0;
  let fail = true;
  const transport = mock.method(nodemailer, "createTransport", () => ({
    async sendMail(mail: Record<string, unknown>) {
      calls++;
      assert.deepEqual(mail.to, { name: values.name, address: values.email });
      if (fail) throw new Error("SMTP failed");
      return { accepted: [values.email], rejected: [], messageId: "test", response: "250 OK" };
    },
    close() {},
  }));
  try {
    await sendPartnerConfirmation(env, lead);
    fail = false;
    await Promise.all([sendPartnerConfirmation(env, lead), sendPartnerConfirmation(env, lead)]);
    await sendPartnerConfirmation(env, lead);
    assert.equal(calls, 2);
  } finally {
    transport.mock.restore();
    rmSync(directory, { recursive: true, force: true });
  }
});
