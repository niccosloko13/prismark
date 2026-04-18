import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não definido.");
  }

  const db = new Pool({
    connectionString: databaseUrl,
    ssl:
      process.env.DATABASE_SSL === "true" || process.env.DATABASE_SSL === "1"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    const schemaPath = path.join(process.cwd(), "server", "db", "schema.sql");
    const schema = await readFile(schemaPath, "utf8");
    await db.query(schema);
    console.log("schema migrated");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("migration failed", error);
  process.exit(1);
});
