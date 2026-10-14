import { downloadUrl, saveReportFile } from "./downloads.ts";
import { createHash } from "node:crypto";
import { claimReport, listLeads, markReport } from "./store.ts";
import { refreshWorkbooks, workbookBuffer } from "./workbooks.ts";
import { sendMail, emailHtml } from "./mail.ts";
import { setting } from "./settings.ts";

export function previousWeek(now = new Date()) {
  const turkey = new Date(now.getTime() + 3 * 3600000);
  const monday = Date.UTC(
    turkey.getUTCFullYear(),
    turkey.getUTCMonth(),
    turkey.getUTCDate() - ((turkey.getUTCDay() + 6) % 7),
  );
  const end = new Date(monday - 3 * 3600000);
  const start = new Date(end.getTime() - 7 * 86400000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: new Date(monday - 7 * 86400000).toISOString().slice(0, 10),
  };
}
export async function weeklyReport(env: unknown, now = new Date()) {
  const to = setting(env, "LEADS_REPORT_TO");
  if (!to) throw new Error("LEADS_REPORT_TO is required");
  const period = previousWeek(now);
  const key = `links:${period.label}:${createHash("sha256").update(to).digest("hex")}`;
  if (!claimReport(env, key)) return { sent: false, reason: "already-sent-or-running", period };
  try {
    await refreshWorkbooks(env);
    const leads = listLeads(env, period.start, period.end);
    const counts = {
      partner: leads.filter((l) => l.values.type === "partner").length,
      interview: leads.filter((l) => l.values.type === "interview").length,
    };
    const date = (value: string) =>
      new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short" }).format(
        new Date(value),
      );
    const pending = leads.filter((l) => l.notification !== "sent").length;
    const links = await Promise.all(
      (["partner", "interview"] as const).map(async (type) => {
        const url = downloadUrl(env, period.label, type);
        await saveReportFile(env, period.label, type, await workbookBuffer(type, leads));
        return {
          label:
            type === "partner" ? "Çözüm ortaklığı Excel’ini indir" : "Gül Baltacı Excel’ini indir",
          url,
        };
      }),
    );
    const subject = `FootBalance — Haftalık Form Raporu (${period.label})`;
    const text = [
      "FootBalance haftalık form kayıtları",
      `Dönem: ${date(period.start)} – ${date(new Date(Date.parse(period.end) - 1).toISOString())} (Türkiye saati)`,
      `Çözüm ortaklığı: ${counts.partner}`,
      `Prof. Dr. Gül Baltacı videosu: ${counts.interview}`,
      `Toplam yeni kayıt: ${leads.length}`,
      ...(pending
        ? [
            `Tekil bildirim e-postası gönderilemeyen / bekleyen kayıt: ${pending}. Bu kayıtlar Excel dosyalarında yer alıyor.`,
          ]
        : []),
      "Excel dosyaları yalnızca bu dönemin kayıtlarını içerir. İndirme bağlantıları 7 gün geçerlidir.",
    ].join("\n");
    await sendMail(env, {
      to,
      subject,
      text: text + "\n\n" + links.map((link) => `${link.label}: ${link.url}`).join("\n\n"),
      html: emailHtml(text, subject, links),
    });
    markReport(env, key, "sent");
    return { sent: true, counts, period };
  } catch (error) {
    markReport(env, key, "failed");
    throw error;
  }
}
