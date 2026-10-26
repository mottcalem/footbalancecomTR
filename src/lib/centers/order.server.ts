import { createHash } from "node:crypto";
import { database } from "./store.server.ts";
import type { ManagedCenter } from "./schema.ts";
export const orderingSnapshot = (centers: Pick<ManagedCenter, "id" | "revision" | "sortOrder">[]) =>
  createHash("sha256")
    .update(JSON.stringify(centers.map((c) => [c.id, c.revision, c.sortOrder])))
    .digest("hex");
export async function reorderCenters(original: string[], order: string[], snapshot: string) {
  if (
    original.length < 2 ||
    original.length > 15 ||
    new Set(original).size !== original.length ||
    order.length !== original.length ||
    new Set(order).size !== order.length ||
    order.some((id) => !original.includes(id))
  )
    return 400;
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    // Serialize with creates, edits and deletes, so the checked snapshot stays valid.
    await client.query("LOCK TABLE service_centers IN SHARE ROW EXCLUSIVE MODE");
    const { rows } = await client.query<{ id: string; revision: number; sortOrder: number }>(
      `SELECT id, revision, (data->>'sortOrder')::int AS "sortOrder" FROM service_centers ORDER BY (data->>'sortOrder')::int, id`,
    );
    if (
      orderingSnapshot(rows) !== snapshot ||
      rows
        .filter((c) => original.includes(c.id))
        .map((c) => c.id)
        .join(",") !== original.join(",")
    ) {
      await client.query("ROLLBACK");
      return 409;
    }
    let index = 0;
    const ids = rows.map((c) => (original.includes(c.id) ? order[index++]! : c.id));
    for (const [rank, id] of ids.entries()) {
      await client.query(
        `UPDATE service_centers SET data=jsonb_set(data,'{sortOrder}',to_jsonb($1::int)), revision=revision+1, updated_at=now() WHERE id=$2 AND (data->>'sortOrder')::int IS DISTINCT FROM $1::int`,
        [rank, id],
      );
    }
    await client.query("COMMIT");
    return 200;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
