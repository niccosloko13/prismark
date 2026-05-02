import type { QueryResultRow } from "pg";

import type { StoreProductPayload, StoreProductRow } from "@/lib/store-product-payload";
import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";

export type { StoreProductRow };

interface DbRow extends QueryResultRow {
  id: string;
  slug: string;
  is_active: boolean;
  featured: boolean;
  deleted_at: string | null;
  payload: StoreProductPayload;
  created_at: string;
  updated_at: string;
}

function mapRow(row: DbRow): StoreProductRow {
  return {
    id: row.id,
    slug: row.slug,
    isActive: row.is_active,
    featured: row.featured,
    deletedAt: row.deleted_at,
    payload: row.payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const storeProductsRepository = {
  /** Admin: inclui inativos; ainda exclui soft-deleted. */
  async listAllNonDeleted(executor: Queryable = { query }): Promise<StoreProductRow[]> {
    const result = await executor.query<DbRow>(
      `SELECT id, slug, is_active, featured, deleted_at, payload, created_at, updated_at
       FROM store_products
       WHERE deleted_at IS NULL
       ORDER BY updated_at DESC`,
    );
    return result.rows.map(mapRow);
  },

  /** Vitrine: apenas ativos e nunca soft-deleted (`deleted_at IS NULL`). */
  async listActiveForStorefront(executor: Queryable = { query }): Promise<StoreProductRow[]> {
    const result = await executor.query<DbRow>(
      `SELECT id, slug, is_active, featured, deleted_at, payload, created_at, updated_at
       FROM store_products
       WHERE deleted_at IS NULL AND is_active = TRUE
       ORDER BY updated_at DESC`,
    );
    return result.rows.map(mapRow);
  },

  async getById(id: string, executor: Queryable = { query }): Promise<StoreProductRow | null> {
    const result = await executor.query<DbRow>(
      `SELECT id, slug, is_active, featured, deleted_at, payload, created_at, updated_at
       FROM store_products WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async slugTaken(slug: string, excludeId: string | null, executor: Queryable = { query }): Promise<boolean> {
    const result = await executor.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM store_products
       WHERE deleted_at IS NULL AND lower(slug) = lower($1)
       ${excludeId ? "AND id <> $2::uuid" : ""}`,
      excludeId ? [slug, excludeId] : [slug],
    );
    return Number(result.rows[0]?.c ?? 0) > 0;
  },

  async insert(
    input: { slug: string; isActive: boolean; featured: boolean; payload: StoreProductPayload },
    executor: Queryable = { query },
  ): Promise<StoreProductRow> {
    const result = await executor.query<DbRow>(
      `INSERT INTO store_products (slug, is_active, featured, payload)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, slug, is_active, featured, deleted_at, payload, created_at, updated_at`,
      [input.slug.trim().toLowerCase(), input.isActive, input.featured, JSON.stringify(input.payload)],
    );
    return mapRow(result.rows[0]);
  },

  async update(
    id: string,
    input: { slug: string; isActive: boolean; featured: boolean; payload: StoreProductPayload },
    executor: Queryable = { query },
  ): Promise<StoreProductRow | null> {
    const result = await executor.query<DbRow>(
      `UPDATE store_products SET
         slug = $2,
         is_active = $3,
         featured = $4,
         payload = $5::jsonb,
         updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, slug, is_active, featured, deleted_at, payload, created_at, updated_at`,
      [id, input.slug.trim().toLowerCase(), input.isActive, input.featured, JSON.stringify(input.payload)],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async patchFlags(
    id: string,
    input: { isActive?: boolean; featured?: boolean },
    executor: Queryable = { query },
  ): Promise<StoreProductRow | null> {
    const sets: string[] = ["updated_at = NOW()"];
    const values: unknown[] = [id];
    let i = 2;
    if (typeof input.isActive === "boolean") {
      sets.push(`is_active = $${i++}`);
      values.push(input.isActive);
    }
    if (typeof input.featured === "boolean") {
      sets.push(`featured = $${i++}`);
      values.push(input.featured);
    }
    if (sets.length === 1) {
      return this.getById(id, executor);
    }
    const result = await executor.query<DbRow>(
      `UPDATE store_products SET ${sets.join(", ")}
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, slug, is_active, featured, deleted_at, payload, created_at, updated_at`,
      values,
    );
    const row = result.rows[0];
    if (!row) return null;
    const mapped = mapRow(row);
    if (typeof input.featured === "boolean") {
      const payload = { ...mapped.payload, product: { ...mapped.payload.product, featured: mapped.featured } };
      await executor.query(`UPDATE store_products SET payload = $2::jsonb, updated_at = NOW() WHERE id = $1`, [
        id,
        JSON.stringify(payload),
      ]);
      return this.getById(id, executor);
    }
    return mapped;
  },

  async softDelete(id: string, executor: Queryable = { query }): Promise<boolean> {
    const result = await executor.query(`UPDATE store_products SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
    return (result.rowCount ?? 0) > 0;
  },

  async duplicate(sourceId: string, executor: Queryable = { query }): Promise<StoreProductRow | null> {
    const source = await this.getById(sourceId, executor);
    if (!source) return null;

    let candidate = `${source.slug}-copia`;
    let n = 2;
    while (await this.slugTaken(candidate, null, executor)) {
      candidate = `${source.slug}-copia-${n}`;
      n += 1;
    }

    const nextPayload: StoreProductPayload = {
      ...source.payload,
      product: {
        ...source.payload.product,
        slug: candidate,
        name: `${source.payload.product.name} (cópia)`,
        featured: false,
      },
      experience: JSON.parse(JSON.stringify(source.payload.experience)) as StoreProductPayload["experience"],
      meta: { ...source.payload.meta },
    };

    return this.insert(
      {
        slug: candidate,
        isActive: false,
        featured: false,
        payload: nextPayload,
      },
      executor,
    );
  },
};
