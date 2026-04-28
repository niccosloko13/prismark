import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import bcrypt from "bcryptjs";
import { Pool } from "pg";

import type { AppUser, OrderRecord } from "../types";

const demoPasswords: Record<string, string> = {
  "admin@prismarq.com.br": "admin123",
  "felipe@novaobra.com.br": "cliente123",
  "camila@studioalto.com.br": "cliente456",
  "niccos@prismarq.com.br": "leleco123",
};

async function loadJson<T>(relativePath: string) {
  const absolutePath = path.join(process.cwd(), relativePath);
  return JSON.parse(await readFile(absolutePath, "utf8")) as T;
}

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
    const users = await loadJson<AppUser[]>("data/users.json");
    const orders = await loadJson<OrderRecord[]>("data/orders.json");
    const client = await db.connect();

    await client.query("BEGIN");
    try {
      for (const user of users) {
        const password = demoPasswords[user.email.toLowerCase()] ?? "TempPass123!";
        const passwordHash = await bcrypt.hash(password, 12);

        await client.query(
          `
            INSERT INTO users (id, name, email, company, phone, role, password_hash, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                email = EXCLUDED.email,
                company = EXCLUDED.company,
                phone = EXCLUDED.phone,
                role = EXCLUDED.role,
                password_hash = EXCLUDED.password_hash,
                updated_at = NOW()
          `,
          [user.id, user.name, user.email.toLowerCase(), user.company, user.phone, user.role, passwordHash, user.createdAt],
        );
      }

      const adminUsername = "niccos";
      const adminEmail = "niccos@prismarq.com.br";
      const adminPasswordHash = await bcrypt.hash("leleco123", 12);
      await client.query(
        `
          INSERT INTO users (id, username, name, email, company, phone, role, password_hash, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, 'admin', $7, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE
          SET username = EXCLUDED.username,
              role = 'admin',
              password_hash = EXCLUDED.password_hash,
              updated_at = NOW()
        `,
        ["usr_admin_niccos", adminUsername, "Niccos Admin", adminEmail, "Prismarq", "Não informado", adminPasswordHash],
      );

      await client.query(
        `
          UPDATE users
          SET username = $2, role = 'admin', password_hash = $3, updated_at = NOW()
          WHERE username = $1
        `,
        [adminUsername, adminUsername, adminPasswordHash],
      );

      for (const order of orders) {
        await client.query(
          `
            INSERT INTO orders (
              id, client_id, product_slug, product_name, width_cm, height_cm, area_m2, quantity,
              material, finishing, deadline, value_total, status, notes, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (id) DO UPDATE
            SET client_id = EXCLUDED.client_id,
                product_slug = EXCLUDED.product_slug,
                product_name = EXCLUDED.product_name,
                width_cm = EXCLUDED.width_cm,
                height_cm = EXCLUDED.height_cm,
                area_m2 = EXCLUDED.area_m2,
                quantity = EXCLUDED.quantity,
                material = EXCLUDED.material,
                finishing = EXCLUDED.finishing,
                deadline = EXCLUDED.deadline,
                value_total = EXCLUDED.value_total,
                status = EXCLUDED.status,
                notes = EXCLUDED.notes,
                updated_at = EXCLUDED.updated_at
          `,
          [
            order.id,
            order.clientId,
            order.productSlug,
            order.productName,
            order.measures.width,
            order.measures.height,
            order.measures.area,
            order.measures.quantity,
            order.material,
            order.finishing,
            order.deadline,
            order.value,
            order.status,
            order.notes ?? null,
            order.createdAt,
            order.updatedAt,
          ],
        );

        if (order.file) {
          const fileId = `fil_seed_${order.id.toLowerCase()}`;

          await client.query(
            `
              INSERT INTO files (
                id, order_id, uploaded_by_user_id, original_name, stored_name, storage_driver,
                relative_path, mime_type, size_bytes, created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, $5, 'local', $6, $7, $8, $9, $10)
              ON CONFLICT (id) DO UPDATE
              SET order_id = EXCLUDED.order_id,
                  uploaded_by_user_id = EXCLUDED.uploaded_by_user_id,
                  original_name = EXCLUDED.original_name,
                  stored_name = EXCLUDED.stored_name,
                  relative_path = EXCLUDED.relative_path,
                  mime_type = EXCLUDED.mime_type,
                  size_bytes = EXCLUDED.size_bytes,
                  updated_at = EXCLUDED.updated_at
            `,
            [
              fileId,
              order.id,
              order.clientId,
              order.file.originalName,
              order.file.storedName,
              order.file.storedName,
              order.file.mimeType,
              order.file.size,
              order.createdAt,
              order.updatedAt,
            ],
          );
        }

        await client.query(
          `
            INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by_user_id, note, created_at)
            VALUES ($1, $2, NULL, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            `hst_seed_${order.id.toLowerCase()}`,
            order.id,
            order.status,
            order.clientId,
            "Importado do dataset legado",
            order.createdAt,
          ],
        );

        await client.query(
          `
            INSERT INTO order_events (id, order_id, action, actor_user_id, payload, created_at)
            VALUES ($1, $2, 'order_imported', $3, $4::jsonb, $5)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            `evt_seed_${order.id.toLowerCase()}`,
            order.id,
            order.clientId,
            JSON.stringify({
              source: "legacy-json",
              status: order.status,
              value: order.value,
            }),
            order.createdAt,
          ],
        );
      }

      const maxNumericOrderId = orders.reduce((max, order) => {
        const numeric = Number(order.id.replace(/\D/g, ""));
        return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
      }, 24030);

      await client.query(`SELECT setval('order_code_seq', $1, true)`, [maxNumericOrderId]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw error;
  } finally {
    await db.end();
  }

  console.log("seed finished");
}

main().catch((error) => {
  console.error("seed failed", error);
  process.exit(1);
});
