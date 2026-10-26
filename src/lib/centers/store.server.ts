import { Pool } from "pg";
import { CENTERS } from "../../data/centers.ts";
import type { ManagedCenter } from "./schema.ts";
let pool: Pool | undefined;
export function database() {
  if (!process.env["DATABASE_URL"]) throw new Error("DATABASE_URL is required");
  return (pool ??= new Pool({
    connectionString: process.env["DATABASE_URL"],
    max: 5,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  }));
}
export async function listCenters(includeInactive = false): Promise<ManagedCenter[]> {
  if (!process.env["DATABASE_URL"])
    return CENTERS.map((c, i) => ({
      ...c,
      id: String(i),
      active: true,
      sortOrder: i,
      revision: 1,
    }));
  const result = await database().query<{
    id: string;
    data: Omit<ManagedCenter, "id" | "revision">;
    revision: number;
  }>(
    `SELECT id, data, revision FROM service_centers ${includeInactive ? "" : "WHERE (data->>'active')::boolean = true"} ORDER BY (data->>'sortOrder')::int, id`,
  );
  return result.rows.map(({ id, data, revision }) => ({ ...data, id, revision }));
}
