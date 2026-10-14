import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { downloadUrl, handleLeadDownload, saveReportFile } from "../src/lib/leads/downloads.ts";

const directory = mkdtempSync(join(tmpdir(), "lead-downloads-"));
after(() => rmSync(directory, { recursive: true, force: true }));
const env = {
  LEADS_DATA_DIR: directory,
  LEADS_REPORT_BASE_URL: "https://example.test",
  LEADS_DOWNLOAD_SECRET: "test-key-for-downloads-at-least-32-characters",
};
test("signed downloads reject tampering, expiry, missing signatures and different files", async () => {
  const now = new Date("2026-10-14T09:00:00Z");
  const url = downloadUrl(env, "2026-10-05", "partner", now);
  await saveReportFile(env, "2026-10-05", "partner", Buffer.from("test workbook"));
  const response = await handleLeadDownload(new Request(url), env, now);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "test workbook");
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.match(response.headers.get("Content-Disposition")!, /attachment;/);
  const invalid = new URL(url);
  invalid.searchParams.delete("signature");
  assert.equal((await handleLeadDownload(new Request(invalid), env, now)).status, 403);
  invalid.searchParams.set("signature", "0".repeat(64));
  assert.equal((await handleLeadDownload(new Request(invalid), env, now)).status, 403);
  assert.equal(
    (await handleLeadDownload(new Request(url.replace("/partner?", "/interview?")), env, now))
      .status,
    403,
  );
  assert.equal(
    (await handleLeadDownload(new Request(url), env, new Date(now.getTime() + 7 * 86400000)))
      .status,
    403,
  );
  assert.equal(
    (await handleLeadDownload(new Request(url, { method: "POST" }), env, now)).status,
    405,
  );
  assert.equal(
    (await handleLeadDownload(new Request(url, { method: "HEAD" }), env, now)).status,
    200,
  );
});
