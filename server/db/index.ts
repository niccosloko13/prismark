import { Pool, type PoolClient, type QueryResultRow } from "pg";

import { env } from "@/server/config/env";

declare global {
  // eslint-disable-next-line no-var
  var __prismarqPool__: Pool | undefined;
}

function createPool() {
  return new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_MAX,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  });
}

export const db =
  globalThis.__prismarqPool__ ??
  createPool();

if (!env.isProduction) {
  globalThis.__prismarqPool__ = db;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
