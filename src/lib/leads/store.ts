import { DatabaseSync } from "node:sqlite";
import { chmodSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { setting } from "./settings.ts";
import type { requestSchema } from "../requests/schema.ts";
import type { z } from "zod";

export type LeadValues = z.output<typeof requestSchema>;
export type Lead = { id: string; submittedAt: string; values: LeadValues; notification: string };
export function dataDirectory(env: unknown) {
  const dir = setting(env, "LEADS_DATA_DIR");
  if (!dir) throw new Error("LEADS_DATA_DIR is required");
  return resolve(dir);
}
export function openStore(env: unknown) {
  const dir = dataDirectory(env);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(join(dir, "leads.sqlite"));
  chmodSync(join(dir, "leads.sqlite"), 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, submitted_at TEXT NOT NULL, type TEXT NOT NULL,
      payload TEXT NOT NULL, payload_hash TEXT NOT NULL, notification TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS lead_receipts (
      id TEXT PRIMARY KEY, status TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS leads_period ON leads(submitted_at, type);
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY, status TEXT NOT NULL, updated_at TEXT NOT NULL
    );`);
  return db;
}
export function saveLead(env: unknown, values: LeadValues): { lead: Lead; duplicate: boolean } {
  const db = openStore(env);
  try {
    const id = values.submissionId ?? randomUUID();
    const payload = JSON.stringify(values);
    const hash = createHash("sha256").update(payload).digest("hex");
    const submittedAt = new Date().toISOString();
    const result = db
      .prepare(
        "INSERT OR IGNORE INTO leads (id, submitted_at, type, payload, payload_hash) VALUES (?, ?, ?, ?, ?)",
      )
      .run(id, submittedAt, values.type, payload, hash);
    const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(id)!;
    if (row["payload_hash"] !== hash) throw new Error("SUBMISSION_ID_CONFLICT");
    return {
      lead: {
        id,
        submittedAt: String(row["submitted_at"]),
        values: JSON.parse(String(row["payload"])),
        notification: String(row["notification"]),
      },
      duplicate: result.changes === 0,
    };
  } finally {
    db.close();
  }
}
export function listLeads(env: unknown, start?: string, end?: string): Lead[] {
  const db = openStore(env);
  try {
    const rows =
      start && end
        ? db
            .prepare(
              "SELECT * FROM leads WHERE submitted_at >= ? AND submitted_at < ? ORDER BY submitted_at, id",
            )
            .all(start, end)
        : db.prepare("SELECT * FROM leads ORDER BY submitted_at, id").all();
    return rows.map((row) => ({
      id: String(row["id"]),
      submittedAt: String(row["submitted_at"]),
      values: JSON.parse(String(row["payload"])),
      notification: String(row["notification"]),
    }));
  } finally {
    db.close();
  }
}
export function markNotification(
  env: unknown,
  id: string,
  status: "sent" | "failed" | "office_sent",
) {
  const db = openStore(env);
  try {
    db.prepare("UPDATE leads SET notification = ? WHERE id = ?").run(status, id);
  } finally {
    db.close();
  }
}
export function claimReport(env: unknown, id: string, now = new Date()) {
  const db = openStore(env);
  try {
    const result = db
      .prepare(
        `INSERT INTO reports (id, status, updated_at) VALUES (?, 'sending', ?)
      ON CONFLICT(id) DO UPDATE SET status='sending', updated_at=excluded.updated_at
      WHERE reports.status='failed' OR (reports.status='sending' AND reports.updated_at < ?)`,
      )
      .run(id, now.toISOString(), new Date(now.getTime() - 30 * 60000).toISOString());
    return result.changes > 0;
  } finally {
    db.close();
  }
}
export function markReport(env: unknown, id: string, status: "sent" | "failed" | "office_sent") {
  const db = openStore(env);
  try {
    db.prepare("UPDATE reports SET status=?, updated_at=? WHERE id=?").run(
      status,
      new Date().toISOString(),
      id,
    );
  } finally {
    db.close();
  }
}

export function claimLeadReceipt(env: unknown, id: string) {
  const db = openStore(env);
  try {
    const now = new Date();
    return (
      db
        .prepare(
          `INSERT INTO lead_receipts (id, status, updated_at) VALUES (?, 'sending', ?)
      ON CONFLICT(id) DO UPDATE SET status='sending', updated_at=excluded.updated_at
      WHERE lead_receipts.status='failed' OR (lead_receipts.status='sending' AND lead_receipts.updated_at < ?)`,
        )
        .run(id, now.toISOString(), new Date(now.getTime() - 30 * 60000).toISOString()).changes > 0
    );
  } finally {
    db.close();
  }
}
export function markLeadReceipt(env: unknown, id: string, status: "sent" | "failed") {
  const db = openStore(env);
  try {
    db.prepare("UPDATE lead_receipts SET status=?, updated_at=? WHERE id=?").run(
      status,
      new Date().toISOString(),
      id,
    );
  } finally {
    db.close();
  }
}
