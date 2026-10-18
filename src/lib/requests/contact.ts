import { sendMail } from "../leads/mail.ts";
import { saveLead, markNotification, type LeadValues } from "../leads/store.ts";
import { setting } from "../leads/settings.ts";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
export function contactConfirmation(values: Pick<LeadValues, "name" | "language" | "subject">) {
  const en = values.language === "en";
  const appointment = values.subject === "Randevu Talebi";
  const subject = en
    ? appointment
      ? "FootBalance | We’ve received your appointment request 📅"
      : "FootBalance | We’ve received your message"
    : appointment
      ? "FootBalance | Randevu Talebinizi Aldık 📅"
      : "FootBalance | Mesajınızı Aldık";
  const greeting = en ? `Dear ${values.name},` : `Sevgili ${values.name},`;
  const intro = en
    ? `Thank you for contacting FootBalance Türkiye. We will respond to your ${appointment ? "appointment request" : "message"} as soon as possible.`
    : `FootBalance Türkiye ile iletişim kurduğunuz için teşekkür ederiz. ${appointment ? "Randevu talebinize" : "Mesajınıza"} en kısa sürede yanıt vereceğiz.`;
  const heading = en ? "Our services:" : "Size Sunacağımız Hizmetler:";
  const services = en
    ? [
        "Our specialist physiotherapists will perform a free foot and gait analysis.",
        "Your custom orthopedic insoles will be prepared within 30 minutes.",
        "You will leave our center with your insoles.",
      ]
    : [
        "Uzman fizyoterapistlerimiz tarafından ücretsiz ayak ve taban analizi yapılacak.",
        "Kişiye özel ortopedik tabanlıklarınız 30 dakika içinde hazırlanacak.",
        "Merkezimizden tabanlıklarınızla ayrılacaksınız.",
      ];
  const questions = en
    ? "You can always contact us with questions or requests for further information."
    : "Sorularınız veya ek bilgi talepleriniz için her zaman bize ulaşabilirsiniz.";
  const regards = en ? "Kind regards," : "Saygılarımızla,";
  const team = en ? "FootBalance Türkiye Team" : "FootBalance Türkiye Ekibi";
  const address = "Esentepe Mah., Atom Sok. No:20, Kanyon Apt. Kat:3 D:5 Şişli / İSTANBUL";
  const hours = en
    ? "Weekdays 08:00–19:00 | Saturday 09:00–18:00 | Sunday (Closed)"
    : "Hafta içi 08:00–19:00 | Cumartesi 09:00–18:00 | Pazar (Kapalıyız)";
  const text = [
    greeting,
    intro,
    heading,
    ...services.map((s) => `• ${s}`),
    questions,
    regards,
    team,
    `${en ? "Phone" : "Telefon"}: +90 212 325 88 51`,
    `${en ? "Address" : "Adres"}: ${address}`,
    `${en ? "Opening hours" : "Çalışma Saatlerimiz"}: ${hours}`,
  ].join("\n\n");
  const html = `<!doctype html><html lang="${en ? "en" : "tr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#fff;color:#333;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 20px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:auto"><tr><td style="font-size:32px;color:#00263e;padding-bottom:24px">FootBalance</td></tr><tr><td style="font-size:14px;line-height:1.6"><p>${escape(greeting)}</p><p style="margin:24px 0">${escape(intro)}</p><p><strong>${heading}</strong></p><ul style="padding-left:18px;margin:20px 0">${services.map((s) => `<li style="color:#159f95"><span style="color:#333">${escape(s)}</span></li>`).join("")}</ul><p style="margin:24px 0">${questions}</p><p>${regards}</p><p><strong style="color:#159f95">${team}</strong><br>${en ? "Phone" : "Telefon"}: <a href="tel:+902123258851">+90 212 325 88 51</a><br>${en ? "Address" : "Adres"}: <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(address)}">${escape(address)}</a></p><p style="margin:24px 0"><strong style="color:#159f95">${en ? "Opening hours" : "Çalışma Saatlerimiz"}:</strong> ${hours}</p><p style="margin-top:36px;font-size:12px"><a href="https://www.instagram.com/FootBalanceTR/" style="color:#666">Instagram</a> &nbsp; <a href="https://www.youtube.com/channel/UCFnMmPY9CVrzRmI7v_8D2gg" style="color:#666">YouTube</a></p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
const pending = new Map<string, Promise<void>>();
export async function submitContact(env: unknown, values: LeadValues) {
  const { lead } = saveLead(env, values);
  const existing = pending.get(lead.id);
  if (existing) return existing;
  const delivery = (async () => {
    if (lead.notification === "sent") return;
    const to = setting(env, "CONTACT_FORM_TO") ?? setting(env, "PARTNER_FORM_TO");
    if (!to) throw new Error("Contact recipient is missing");
    if (lead.notification !== "office_sent") {
      await sendMail(env, {
        to,
        replyTo: { name: values.name, address: values.email },
        subject: `FootBalance — İletişim: ${values.subject}`,
        text: [
          `Ad Soyad: ${values.name}`,
          `E-posta: ${values.email}`,
          `Telefon: ${values.phone}`,
          `Şehir: ${values.city}`,
          `Konu: ${values.subject}`,
          `Mesaj: ${values.message}`,
          `Dil: ${values.language}`,
          "İletişim onayı: Evet",
        ].join("\n"),
      });
      markNotification(env, lead.id, "office_sent");
    }
    await sendMail(env, {
      to: { name: values.name, address: values.email },
      replyTo: to,
      ...contactConfirmation(values),
    });
    markNotification(env, lead.id, "sent");
  })();
  pending.set(lead.id, delivery);
  try {
    await delivery;
  } finally {
    pending.delete(lead.id);
  }
}
