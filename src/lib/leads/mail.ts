import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index.js";
import { setting } from "./settings.ts";

export function emailHtml(
  text: string,
  subject: string,
  links: { label: string; url: string }[] = [],
  language: "tr" | "en" = "tr",
) {
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char]!,
    );
  const buttons = links
    .map(
      (link) =>
        `<p style="margin:20px 0"><a href="${escape(link.url)}" style="display:inline-block;padding:12px 18px;background:#00263e;color:white;text-decoration:none;border-radius:6px">${escape(link.label)}</a></p>`,
    )
    .join("");
  return `<!doctype html><html lang="${language}"><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f8f8;font-family:Arial,sans-serif;color:#00263e"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:auto;background:white;border:1px solid #dce8e8"><tr><td style="padding:24px;background:#00263e;color:white;font-size:22px;font-weight:bold">FootBalance Türkiye</td></tr><tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 20px">${escape(subject)}</h1><div style="font-size:15px;line-height:1.7;overflow-wrap:anywhere">${escape(text).replace(/\r?\n/g, "<br>")}</div>${buttons}</td></tr></table></td></tr></table></body></html>`;
}

export async function sendMail(env: unknown, message: Mail.Options) {
  if (typeof message.text !== "string" || !message.text.trim())
    throw new Error("Email body must not be empty");
  const host = setting(env, "SMTP_HOST");
  const user = setting(env, "SMTP_USER");
  const pass = setting(env, "SMTP_PASSWORD");
  const from = setting(env, "SMTP_FROM");
  const port = Number(setting(env, "SMTP_PORT") ?? "587");
  if (!host || !user || !pass || !from || !Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("SMTP settings are incomplete");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { minVersion: "TLSv1.2" },
  });
  try {
    const result = await transport.sendMail({
      ...message,
      html: message.html ?? emailHtml(message.text, message.subject ?? "FootBalance"),
      textEncoding: "base64",
      from: { name: "FootBalance Türkiye", address: from },
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (!result.accepted.length || result.rejected.length)
      throw new Error("SMTP recipient rejected");
    console.info(
      "SMTP accepted message",
      JSON.stringify({ messageId: result.messageId, response: result.response }),
    );
    return { messageId: result.messageId, response: result.response };
  } finally {
    transport.close();
  }
}
