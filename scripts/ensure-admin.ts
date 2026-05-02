/**
 * Garante um único usuário admin (credenciais fixas) e rebaixa demais admins para cliente.
 * Login no painel: /admin/login usa **username**, não e-mail — o username é a parte local do e-mail alvo.
 */
import "dotenv/config";

import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { Pool } from "pg";

import { env } from "@/server/config/env";

const TARGET_EMAIL = "nicollas@prismarq.com.br";
const TARGET_PASSWORD = "leleco123";

function deriveUsername(email: string): string {
  const local = email.split("@")[0]?.trim().toLowerCase() ?? "admin";
  return local.replace(/[^a-z0-9._-]/g, "") || "admin";
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não definido.");
  }

  const email = TARGET_EMAIL.toLowerCase();
  const username = deriveUsername(TARGET_EMAIL);
  const passwordHash = await bcrypt.hash(TARGET_PASSWORD, env.BCRYPT_SALT_ROUNDS);

  const db = new Pool({
    connectionString: databaseUrl,
    ssl:
      process.env.DATABASE_SSL === "true" || process.env.DATABASE_SSL === "1"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        UPDATE users
        SET username = NULL, updated_at = NOW()
        WHERE LOWER(username) = LOWER($1) AND LOWER(email) <> LOWER($2)
      `,
      [username, email],
    );

    const existing = await client.query<{ id: string }>(`SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [
      email,
    ]);

    if (existing.rows[0]) {
      await client.query(
        `
          UPDATE users
          SET
            password_hash = $2,
            role = 'admin',
            is_active = TRUE,
            username = $3,
            updated_at = NOW()
          WHERE LOWER(email) = LOWER($1)
        `,
        [email, passwordHash, username],
      );
      console.log(`Atualizado: ${email} → admin, is_active=true, username=${username}`);
    } else {
      const id = `usr_${crypto.randomUUID()}`;
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);
      await client.query(
        `
          INSERT INTO users (
            id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'admin', 'credentials', NULL, NULL, $7, TRUE)
        `,
        [id, username, displayName, email, "Prismarq", "Não informado", passwordHash],
      );
      console.log(`Criado: ${email} (id ${id}) → admin, username=${username}`);
    }

    const demoted = await client.query<{ email: string }>(
      `
        UPDATE users
        SET role = 'client', updated_at = NOW()
        WHERE role = 'admin' AND LOWER(email) <> LOWER($1)
        RETURNING email
      `,
      [email],
    );

    for (const row of demoted.rows) {
      console.log(`Rebaixado para client: ${row.email}`);
    }

    if (demoted.rowCount === 0) {
      console.log("Nenhum outro admin para rebaixar.");
    }

    await client.query("COMMIT");

    const summary = await client.query<{ email: string; role: string; is_active: boolean }>(
      `SELECT email, role, is_active FROM users ORDER BY email`,
    );

    console.log("\nUsuários (email, role, is_active):");
    for (const row of summary.rows) {
      console.log(`  ${row.email} | ${row.role} | ${row.is_active}`);
    }

    console.log(`\nPainel admin: usuário "${username}" / senha definida. E-mail na base: ${email}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await db.end();
  }
}

main().catch((error) => {
  console.error("ensure-admin falhou:", error);
  process.exit(1);
});
