import { sendPartnerConfirmation } from "./partner-confirmation.ts";
import { saveLead, markNotification, type LeadValues } from "./store.ts";
import { refreshWorkbooks } from "./workbooks.ts";
import { sendMail } from "./mail.ts";
import { setting } from "./settings.ts";

export async function archiveSubmission(env: unknown, values: LeadValues) {
  const { lead, duplicate } = saveLead(env, values);
  if (!duplicate) {
    try {
      const to =
        values.type === "interview"
          ? (setting(env, "INTERVIEW_FORM_TO") ?? setting(env, "PARTNER_FORM_TO"))
          : setting(env, "PARTNER_FORM_TO");
      if (!to) throw new Error("Notification recipient is missing");
      await sendMail(env, {
        to,
        replyTo: { name: values.name, address: values.email },
        subject:
          values.type === "interview"
            ? "FootBalance — Prof. Dr. Gül Baltacı video erişim talebi"
            : "FootBalance — Yeni çözüm ortaklığı başvurusu",
        text: [
          values.type === "interview"
            ? "Prof. Dr. Gül Baltacı video erişim talebi"
            : "Çözüm ortaklığı başvurusu",
          `Kayıt ID: ${lead.id}`,
          `Kayıt tarihi: ${lead.submittedAt}`,
          `Ad Soyad: ${values.name}`,
          `E-posta: ${values.email}`,
          `Telefon: ${values.phone}`,
          ...(values.type === "partner"
            ? [
                `Şehir: ${values.city}`,
                `Firma / Merkez: ${values.company}`,
                `Faaliyet Alanı: ${values.field}`,
                `Mesaj: ${values.message || "—"}`,
              ]
            : [`Meslek: ${values.profession}`]),
          "İletişim onayı: Evet",
          `Dil: ${values.language}`,
        ].join("\n"),
      });
      markNotification(env, lead.id, "sent");
    } catch {
      markNotification(env, lead.id, "failed");
      console.error("Lead saved; notification failed", lead.id);
    }
  }
  if (values.type === "partner") await sendPartnerConfirmation(env, lead);
  // The durable record remains available even if a workbook export needs retrying.
  try {
    await refreshWorkbooks(env);
  } catch {
    console.error("Lead saved; workbook export failed", lead.id);
  }
  return lead;
}
