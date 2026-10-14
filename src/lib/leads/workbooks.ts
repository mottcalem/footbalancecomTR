import ExcelJS from "exceljs";
import { mkdir, open, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDirectory, listLeads, type Lead } from "./store.ts";

export const LEAD_FILES = {
  partner: "cozum-ortagi-leadler.xlsx",
  interview: "gul-baltaci-leadler.xlsx",
} as const;
export async function workbookBuffer(type: keyof typeof LEAD_FILES, leads: Lead[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FootBalance Türkiye";
  const sheet = workbook.addWorksheet(type === "partner" ? "Çözüm Ortaklığı" : "Gül Baltacı", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const columns = [
    { header: "Kayıt ID", key: "id", width: 38 },
    { header: "Kayıt Tarihi (Türkiye)", key: "date", width: 24 },
    { header: "Ad Soyad", key: "name", width: 28 },
    { header: "E-posta", key: "email", width: 34 },
    { header: "Telefon", key: "phone", width: 22 },
    ...(type === "partner"
      ? [
          { header: "Şehir", key: "city", width: 20 },
          { header: "Firma / Merkez", key: "company", width: 32 },
          { header: "Faaliyet Alanı", key: "field", width: 32 },
          { header: "Mesaj", key: "message", width: 65 },
        ]
      : [{ header: "Meslek", key: "profession", width: 28 }]),
    { header: "İletişim Onayı", key: "consent", width: 20 },
    { header: "Dil", key: "language", width: 10 },
    { header: "Bildirim E-postası", key: "notification", width: 22 },
  ];
  sheet.columns = columns;
  const rows = leads
    .filter((lead) => lead.values.type === type)
    .map((lead) => ({
      ...lead.values,
      id: lead.id,
      date: new Date(Date.parse(lead.submittedAt) + 3 * 3600000),
      consent: lead.values.consent ? "Evet" : "Hayır",
      language: lead.values.language.toUpperCase(),
      notification:
        { sent: "SMTP kabul etti", failed: "Gönderilemedi", pending: "Bekliyor" }[
          lead.notification
        ] ?? lead.notification,
    }));
  sheet.addRows(rows);
  sheet.getColumn("date").numFmt = "dd.mm.yyyy hh:mm";
  sheet.getColumn("phone").numFmt = "@";
  sheet.getRow(1).height = 32;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00263E" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.height = type === "partner" ? 60 : 32;
    row.eachCell((cell) => {
      cell.font = { size: 11, color: { argb: "FF00263E" } };
      cell.alignment = { vertical: "top", wrapText: true };
      if (index % 2 === 0)
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF7F5" } };
    });
    if (type === "partner") {
      const lines = String(row.getCell("message").value ?? "")
        .split("\n")
        .reduce((count, line) => count + Math.max(1, Math.ceil(line.length / 60)), 0);
      row.height = Math.min(409, Math.max(60, lines * 16));
    }
  });
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, sheet.rowCount), column: columns.length },
  };
  sheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printTitlesRow: "1:1",
  };
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
export async function refreshWorkbooks(env: unknown) {
  const dir = dataDirectory(env);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const lockPath = join(dir, "export.lock");
  let lock;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      lock = await open(lockPath, "wx", 0o600);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const metadata = await stat(lockPath).catch(() => null);
      if (metadata && Date.now() - metadata.mtimeMs > 5 * 60000)
        await rm(lockPath, { force: true });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  if (!lock) throw new Error("Workbook export is busy");
  try {
    const leads = listLeads(env);
    for (const type of ["partner", "interview"] as const) {
      const target = join(dir, LEAD_FILES[type]);
      const temporary = `${target}.${process.pid}.tmp`;
      await writeFile(temporary, await workbookBuffer(type, leads), { mode: 0o600 });
      await rename(temporary, target);
    }
  } finally {
    await lock.close();
    await rm(lockPath, { force: true });
  }
}
