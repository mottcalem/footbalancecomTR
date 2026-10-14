import { handleLeadDownload } from "../src/lib/leads/downloads.ts";
import assert from "node:assert/strict";
import { after, mock, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import { requestSchema } from "../src/lib/requests/schema.ts";
import { listLeads, openStore, saveLead } from "../src/lib/leads/store.ts";
import { LEAD_FILES, refreshWorkbooks } from "../src/lib/leads/workbooks.ts";
import { previousWeek, weeklyReport } from "../src/lib/leads/report.ts";

const directory = mkdtempSync(join(tmpdir(), "footbalance-leads-"));
after(() => rmSync(directory, { recursive: true, force: true }));
const env = {
  LEADS_DATA_DIR: directory,
  SMTP_HOST: "smtp.example.test",
  SMTP_USER: "user",
  SMTP_PASSWORD: "secret",
  SMTP_FROM: "info@example.test",
  LEADS_REPORT_TO: "recipient@example.test",
  LEADS_REPORT_BASE_URL: "https://footbalance.example.test",
  LEADS_DOWNLOAD_SECRET: "test-key-for-downloads-at-least-32-characters",
};
const values = requestSchema.parse({
  type: "partner",
  name: "=SUM(1,2)",
  email: "test@example.test",
  phone: "+90 555 123 45 67",
  city: "İstanbul",
  company: "Test Clinic",
  field: "Diğer",
  language: "tr",
  consent: true,
  submissionId: crypto.randomUUID(),
});

test("durable leads deduplicate retries and survive reopening", () => {
  const first = saveLead(env, values);
  assert.equal(first.duplicate, false);
  assert.equal(saveLead(env, values).duplicate, true);
  assert.equal(listLeads(env).length, 1);
  assert.throws(
    () => saveLead(env, { ...values, name: "Different Person" }),
    /SUBMISSION_ID_CONFLICT/,
  );
  assert.equal(listLeads(env)[0]?.values.name, values.name);
});

test("separate workbooks retain phone strings, real dates and literal formula-like input", async () => {
  const interview = requestSchema.parse({
    type: "interview",
    name: "Test Viewer",
    email: "viewer@example.test",
    phone: "+90 555 123 45 68",
    profession: "Fizyoterapist",
    language: "tr",
    consent: true,
  });
  saveLead(env, interview);
  await Promise.all([refreshWorkbooks(env), refreshWorkbooks(env)]);
  for (const type of ["partner", "interview"] as const) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(join(directory, LEAD_FILES[type]));
    const sheet = workbook.worksheets[0]!;
    assert.equal(sheet.rowCount, 2);
    assert.equal(sheet.getCell("B2").type, ExcelJS.ValueType.Date);
    assert.equal(sheet.getCell("E2").type, ExcelJS.ValueType.String);
    assert.equal(sheet.getCell("E2").value, type === "partner" ? values.phone : interview.phone);
    assert.equal(sheet.getCell("C2").value, type === "partner" ? values.name : interview.name);
    assert.equal(sheet.getCell("C2").type, ExcelJS.ValueType.String);
    assert.ok(sheet.autoFilter);
    assert.equal(sheet.views[0]?.state, "frozen");
  }
});

test("weekly period uses Monday midnight Istanbul, including Sunday and excluding next Monday", async () => {
  const now = new Date("2026-10-19T06:00:00Z");
  const period = previousWeek(now);
  assert.deepEqual(period, {
    start: "2026-10-11T21:00:00.000Z",
    end: "2026-10-18T21:00:00.000Z",
    label: "2026-10-12",
  });
  const db = openStore(env);
  db.prepare("UPDATE leads SET submitted_at=? WHERE type='partner'").run(period.start);
  db.prepare("UPDATE leads SET submitted_at=? WHERE type='interview'").run(
    "2026-10-18T20:59:59.999Z",
  );
  db.close();
  const excluded = saveLead(env, { ...values, submissionId: crypto.randomUUID() }).lead;
  const other = openStore(env);
  other.prepare("UPDATE leads SET submitted_at=? WHERE id=?").run(period.end, excluded.id);
  other.close();
  assert.equal(listLeads(env, period.start, period.end).length, 2);
  let calls = 0;
  let fail = true;
  const mocked = mock.method(nodemailer, "createTransport", () => ({
    sendMail: async (mail: { to: string; text: string; html: string; attachments?: unknown }) => {
      calls++;
      if (fail) throw new Error("SMTP failure");
      assert.equal(mail.to, env.LEADS_REPORT_TO);
      assert.equal(mail.attachments, undefined);
      const links = mail.text.match(/https:\/\/[^\s]+/g)!;
      assert.equal(links.length, 2);
      assert.match(mail.html, /Excel’ini indir/);
      for (const link of links) {
        const response = await handleLeadDownload(new Request(link), env);
        assert.equal(response.status, 200);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()));
        assert.equal(workbook.worksheets[0]?.rowCount, 2);
      }
      return { accepted: [env.LEADS_REPORT_TO], rejected: [] };
    },
    close() {},
  }));
  try {
    await assert.rejects(weeklyReport(env, now), /SMTP failure/);
    fail = false;
    assert.equal((await weeklyReport(env, now)).sent, true);
    assert.equal((await weeklyReport(env, now)).sent, false);
    assert.equal(calls, 2);
  } finally {
    mocked.mock.restore();
  }
});
