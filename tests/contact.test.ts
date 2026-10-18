import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { contactConfirmation } from "../src/lib/requests/contact.ts";
import { handleRequestSubmission } from "../src/lib/requests/handler.ts";
import { requestSchema } from "../src/lib/requests/schema.ts";

const contact = {
  type: "contact",
  name: "Test User",
  language: "tr",
  phone: "0212 325 88 51",
  email: "customer@example.test",
  city: "İstanbul",
  subject: "Randevu Talebi",
  message: "Bilgi almak istiyorum.",
  consent: true,
};
test("contact requires valid recipient, subject, message and consent", () => {
  assert.equal(requestSchema.safeParse(contact).success, true);
  for (const patch of [
    { email: "" },
    { email: "bad" },
    { subject: "" },
    { subject: "invalid" },
    { message: " " },
    { consent: false },
    { website: "bot" },
  ]) {
    assert.equal(requestSchema.safeParse({ ...contact, ...patch }).success, false);
  }
});
test("confirmation is localized, personalized, HTML escaped, and matches the topic", () => {
  for (const language of ["tr", "en"] as const) {
    const mail = contactConfirmation({
      name: "A <script> & B",
      language,
      subject: "Randevu Talebi",
    });
    assert.match(mail.html, new RegExp(`lang="${language}"`));
    assert.ok(mail.html.includes("A &lt;script&gt; &amp; B"));
    assert.ok(!mail.html.includes("<script>"));
    assert.match(
      mail.subject,
      language === "tr" ? /Randevu Talebinizi Aldık/ : /appointment request/,
    );
    assert.match(mail.text, /30/);
    assert.match(mail.html, /tel:\+902123258851/);
    const general = contactConfirmation({ name: "User", language, subject: "Geri Bildirim" });
    assert.match(general.subject, language === "tr" ? /Mesajınızı Aldık/ : /received your message/);
  }
});
test("contact sends office and localized customer mail, retries failed confirmation without resending office mail", async () => {
  const dir = mkdtempSync(join(tmpdir(), "footbalance-contact-"));
  const env = {
    LEADS_DATA_DIR: dir,
    CONTACT_FORM_TO: "office@example.test",
    SMTP_HOST: "smtp.example.test",
    SMTP_USER: "user",
    SMTP_PASSWORD: "secret",
    SMTP_FROM: "sender@example.test",
  };
  const sent: Record<string, unknown>[] = [];
  let rejectCustomer = true;
  const transport = mock.method(nodemailer, "createTransport", () => ({
    async sendMail(options: Record<string, unknown>) {
      if (typeof options.to === "object" && rejectCustomer) throw new Error("SMTP unavailable");
      sent.push(options);
      return {
        accepted: ["ok@example.test"],
        rejected: [],
        messageId: "test",
        response: "250 queued",
      };
    },
    close() {},
  }));
  const submissionId = randomUUID();
  const request = (patch = {}) =>
    new Request("https://example.test/api/requests", {
      method: "POST",
      headers: { origin: "https://example.test", "Content-Type": "application/json" },
      body: JSON.stringify({ ...contact, language: "en", submissionId, ...patch }),
    });
  try {
    assert.equal((await handleRequestSubmission(request({ email: "bad" }), env)).status, 400);
    assert.equal(sent.length, 0);
    assert.equal((await handleRequestSubmission(request(), env)).status, 503);
    assert.equal(sent.length, 1);
    rejectCustomer = false;
    assert.equal((await handleRequestSubmission(request(), env)).status, 202);
    assert.equal(sent.length, 2);
    assert.equal(sent[0]!.to, "office@example.test");
    assert.deepEqual(sent[1]!.to, { name: "Test User", address: "customer@example.test" });
    assert.match(String(sent[1]!.html), /lang="en"/);
    assert.equal((await handleRequestSubmission(request(), env)).status, 202);
    assert.equal(sent.length, 2);
  } finally {
    transport.mock.restore();
    rmSync(dir, { recursive: true, force: true });
  }
});
