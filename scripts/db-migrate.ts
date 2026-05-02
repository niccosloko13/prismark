import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
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

    const migrationsDir = path.join(process.cwd(), "server", "db", "migrations");
    try {
      const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
      for (const file of files) {
        const sql = await readFile(path.join(migrationsDir, file), "utf8");
        await db.query(sql);
        console.log(`migration applied: ${file}`);
      }
    } catch (readError) {
      const code = readError && typeof readError === "object" && "code" in readError ? (readError as { code: string }).code : "";
      if (code !== "ENOENT") {
        throw readError;
      }
    }
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("migration failed", error);
  process.exit(1);
});
