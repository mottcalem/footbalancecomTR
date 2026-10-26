import { readFile } from "node:fs/promises";
import pg from "pg";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(84214526)");
  await client.query(`
    CREATE TABLE IF NOT EXISTS service_centers (id text PRIMARY KEY, data jsonb NOT NULL, revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE IF NOT EXISTS admin_sessions (token_hash text PRIMARY KEY, csrf text NOT NULL, expires_at timestamptz NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_login_attempts (id integer PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
    CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions(expires_at);
    CREATE TABLE IF NOT EXISTS app_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
  `);
  const { rowCount } = await client.query(
    "SELECT id FROM app_migrations WHERE id='centers-initial-v1'",
  );
  if (!rowCount) {
    const centers = JSON.parse(
      await readFile(new URL("../deploy/centers-seed.json", import.meta.url), "utf8"),
    );
    for (const [i, c] of centers.entries())
      await client.query(
        "INSERT INTO service_centers(id,data) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING",
        [String(i), { ...c, active: true, sortOrder: i }],
      );
    await client.query("INSERT INTO app_migrations(id) VALUES ('centers-initial-v1')");
    console.log(`Imported ${centers.length} service centers.`);
  } else console.log("Centers migration already applied; existing edits preserved.");
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
