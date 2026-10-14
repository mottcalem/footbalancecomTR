import assert from "node:assert/strict";
import { mock, test } from "node:test";
import nodemailer from "nodemailer";
import { emailHtml, sendMail } from "../src/lib/leads/mail.ts";

const env = {
  SMTP_HOST: "smtp.example.test",
  SMTP_PORT: "587",
  SMTP_USER: "user",
  SMTP_PASSWORD: "secret",
  SMTP_FROM: "info@example.test",
};
test("mail contains both populated plain text and HTML MIME parts", async () => {
  const original = nodemailer.createTransport.bind(nodemailer);
  const stream = original({ streamTransport: true, buffer: true, newline: "windows" });
  let raw = "";
  const mocked = mock.method(nodemailer, "createTransport", () => ({
    sendMail: async (options: Record<string, unknown>) => {
      assert.equal(options.text, "Ad Soyad: Türkçe Test\nMesaj: <script>alert(1)</script>");
      assert.match(String(options.html), /Ad Soyad: Türkçe Test<br>/);
      assert.ok(!String(options.html).includes("<script>"));
      const compiled = await stream.sendMail(options);
      raw = compiled.message.toString();
      return {
        accepted: ["recipient@example.test"],
        rejected: [],
        messageId: "test-id",
        response: "250 queued",
      };
    },
    close() {},
  }));
  try {
    await sendMail(env, {
      to: "recipient@example.test",
      subject: "Form Bildirimi",
      text: "Ad Soyad: Türkçe Test\nMesaj: <script>alert(1)</script>",
    });
    assert.match(raw, /Content-Type: multipart\/alternative/);
    assert.match(raw, /Content-Type: text\/plain; charset=utf-8/);
    assert.match(raw, /Content-Type: text\/html; charset=utf-8/);
    assert.ok(
      raw
        .replace(/\r?\n/g, "")
        .includes(
          Buffer.from("Ad Soyad: Türkçe Test\nMesaj: <script>alert(1)</script>").toString("base64"),
        ),
    );
  } finally {
    mocked.mock.restore();
  }
});
test("empty messages are rejected and dynamic HTML is escaped", async () => {
  await assert.rejects(
    sendMail(env, { to: "recipient@example.test", subject: "Empty", text: " " }),
    /must not be empty/,
  );
  assert.match(emailHtml("A & B", "<Test>"), /&lt;Test&gt;/);
  assert.match(emailHtml("A & B", "Test"), /A &amp; B/);
});
