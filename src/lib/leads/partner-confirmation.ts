import { emailHtml, sendMail } from "./mail.ts";
import { claimLeadReceipt, markLeadReceipt, type Lead } from "./store.ts";
import { setting } from "./settings.ts";

export function partnerConfirmation(name: string, language: "tr" | "en") {
  const subject =
    language === "en"
      ? "FootBalance | We’ve received your partnership application"
      : "FootBalance | Çözüm Ortaklığı Başvurunuzu Aldık";
  const text =
    language === "en"
      ? [
          `Dear ${name},`,
          "Thank you for your interest in becoming a FootBalance partner.",
          "We have received your application and are reviewing it. Our team will contact you as soon as possible about the next steps.",
          "If you have any questions, you can reach us on +90 212 325 88 51 or at info@onbrands.com.tr.",
          "Kind regards,",
          "FootBalance Türkiye Team",
        ].join("\n\n")
      : [
          `Sayın ${name},`,
          "FootBalance çözüm ortaklığına gösterdiğiniz ilgi için teşekkür ederiz.",
          "Başvurunuzu aldık, değerlendiriyoruz. Ekibimiz başvurunuzu inceleyerek sonraki adımlar hakkında en kısa sürede sizinle iletişime geçecek.",
          "Sorularınız için 0212 325 88 51 numaralı telefondan veya info@onbrands.com.tr adresinden bize ulaşabilirsiniz.",
          "Saygılarımızla,",
          "FootBalance Türkiye Ekibi",
        ].join("\n\n");
  return { subject, text, html: emailHtml(text, subject, [], language) };
}
export async function sendPartnerConfirmation(env: unknown, lead: Lead) {
  if (!claimLeadReceipt(env, lead.id)) return;
  try {
    await sendMail(env, {
      to: { name: lead.values.name, address: lead.values.email },
      replyTo: setting(env, "PARTNER_FORM_TO") ?? "info@onbrands.com.tr",
      ...partnerConfirmation(lead.values.name, lead.values.language),
    });
    markLeadReceipt(env, lead.id, "sent");
  } catch {
    markLeadReceipt(env, lead.id, "failed");
    console.error("Lead saved; partner confirmation failed", lead.id);
  }
}
