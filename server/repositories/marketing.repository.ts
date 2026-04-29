import crypto from "node:crypto";

import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";

export interface HomeFeaturedRecord {
  id: string;
  productSlug: string;
  sortOrder: number;
  active: boolean;
}

export interface MarketingBannerRecord {
  id: string;
  title: string | null;
  imageUrl: string;
  href: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  maxUses: number | null;
  usesCount: number;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

function mapFeatured(row: QueryResultRow & Record<string, unknown>): HomeFeaturedRecord {
  return {
    id: String(row.id),
    productSlug: String(row.product_slug),
    sortOrder: Number(row.sort_order),
    active: Boolean(row.active),
  };
}

function mapBanner(row: QueryResultRow & Record<string, unknown>): MarketingBannerRecord {
  return {
    id: String(row.id),
    title: row.title != null ? String(row.title) : null,
    imageUrl: String(row.image_url),
    href: row.href != null ? String(row.href) : null,
    sortOrder: Number(row.sort_order),
    active: Boolean(row.active),
    createdAt: new Date(row.created_at as Date | string).toISOString(),
  };
}

function mapCoupon(row: QueryResultRow & Record<string, unknown>): CouponRecord {
  return {
    id: String(row.id),
    code: String(row.code),
    discountType: row.discount_type as CouponRecord["discountType"],
    discountValue: Number(row.discount_value),
    active: Boolean(row.active),
    maxUses: row.max_uses != null ? Number(row.max_uses) : null,
    usesCount: Number(row.uses_count),
    validFrom: row.valid_from ? new Date(row.valid_from as Date | string).toISOString() : null,
    validUntil: row.valid_until ? new Date(row.valid_until as Date | string).toISOString() : null,
    createdAt: new Date(row.created_at as Date | string).toISOString(),
  };
}

export const marketingRepository = {
  async listFeaturedActive(executor: Queryable = { query }): Promise<HomeFeaturedRecord[]> {
    const result = await executor.query(
      `
        SELECT id, product_slug, sort_order, active
        FROM home_featured_slugs
        WHERE active = TRUE
        ORDER BY sort_order ASC, product_slug ASC
      `,
    );
    return result.rows.map((row) => mapFeatured(row));
  },

  async listFeaturedAll(executor: Queryable = { query }): Promise<HomeFeaturedRecord[]> {
    const result = await executor.query(
      `SELECT id, product_slug, sort_order, active FROM home_featured_slugs ORDER BY sort_order ASC`,
    );
    return result.rows.map((row) => mapFeatured(row));
  },

  async addFeatured(productSlug: string, sortOrder: number, executor: Queryable = { query }) {
    const id = `hfs_${crypto.randomUUID()}`;
    await executor.query(
      `
        INSERT INTO home_featured_slugs (id, product_slug, sort_order, active)
        VALUES ($1, $2, $3, TRUE)
      `,
      [id, productSlug, sortOrder],
    );
    return id;
  },

  async updateFeatured(
    id: string,
    input: { productSlug?: string; sortOrder?: number; active?: boolean },
    executor: Queryable = { query },
  ) {
    const cur = await executor.query<{ product_slug: string; sort_order: number; active: boolean }>(
      `SELECT product_slug, sort_order, active FROM home_featured_slugs WHERE id = $1`,
      [id],
    );
    const row = cur.rows[0];
    if (!row) {
      return;
    }
    const productSlug = input.productSlug !== undefined ? input.productSlug : row.product_slug;
    const sortOrder = input.sortOrder !== undefined ? input.sortOrder : row.sort_order;
    const active = input.active !== undefined ? input.active : row.active;
    await executor.query(
      `UPDATE home_featured_slugs SET product_slug = $2, sort_order = $3, active = $4 WHERE id = $1`,
      [id, productSlug, sortOrder, active],
    );
  },

  async deleteFeatured(id: string, executor: Queryable = { query }) {
    await executor.query(`DELETE FROM home_featured_slugs WHERE id = $1`, [id]);
  },

  async listBannersActive(executor: Queryable = { query }): Promise<MarketingBannerRecord[]> {
    const result = await executor.query(
      `
        SELECT id, title, image_url, href, sort_order, active, created_at
        FROM marketing_banners
        WHERE active = TRUE
        ORDER BY sort_order ASC
      `,
    );
    return result.rows.map((row) => mapBanner(row));
  },

  async listBannersAll(executor: Queryable = { query }): Promise<MarketingBannerRecord[]> {
    const result = await executor.query(
      `SELECT id, title, image_url, href, sort_order, active, created_at FROM marketing_banners ORDER BY sort_order ASC`,
    );
    return result.rows.map((row) => mapBanner(row));
  },

  async addBanner(
    input: { title?: string | null; imageUrl: string; href?: string | null; sortOrder: number; active?: boolean },
    executor: Queryable = { query },
  ) {
    const id = `bnr_${crypto.randomUUID()}`;
    await executor.query(
      `
        INSERT INTO marketing_banners (id, title, image_url, href, sort_order, active)
        VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE))
      `,
      [id, input.title ?? null, input.imageUrl, input.href ?? null, input.sortOrder, input.active ?? true],
    );
    return id;
  },

  async updateBanner(
    id: string,
    input: Partial<{ title: string | null; imageUrl: string; href: string | null; sortOrder: number; active: boolean }>,
    executor: Queryable = { query },
  ) {
    const cur = await executor.query<{
      title: string | null;
      image_url: string;
      href: string | null;
      sort_order: number;
      active: boolean;
    }>(`SELECT title, image_url, href, sort_order, active FROM marketing_banners WHERE id = $1`, [id]);
    const row = cur.rows[0];
    if (!row) {
      return;
    }
    await executor.query(
      `
        UPDATE marketing_banners
        SET title = $2, image_url = $3, href = $4, sort_order = $5, active = $6
        WHERE id = $1
      `,
      [
        id,
        input.title !== undefined ? input.title : row.title,
        input.imageUrl !== undefined ? input.imageUrl : row.image_url,
        input.href !== undefined ? input.href : row.href,
        input.sortOrder !== undefined ? input.sortOrder : row.sort_order,
        input.active !== undefined ? input.active : row.active,
      ],
    );
  },

  async deleteBanner(id: string, executor: Queryable = { query }) {
    await executor.query(`DELETE FROM marketing_banners WHERE id = $1`, [id]);
  },

  async listCoupons(executor: Queryable = { query }): Promise<CouponRecord[]> {
    const result = await executor.query(
      `
        SELECT id, code, discount_type, discount_value, active, max_uses, uses_count, valid_from, valid_until, created_at
        FROM coupons
        ORDER BY created_at DESC
      `,
    );
    return result.rows.map((row) => mapCoupon(row));
  },

  async addCoupon(
    input: {
      code: string;
      discountType: "percent" | "fixed";
      discountValue: number;
      active?: boolean;
      maxUses?: number | null;
      validFrom?: string | null;
      validUntil?: string | null;
    },
    executor: Queryable = { query },
  ) {
    const id = `cpn_${crypto.randomUUID()}`;
    await executor.query(
      `
        INSERT INTO coupons (id, code, discount_type, discount_value, active, max_uses, valid_from, valid_until)
        VALUES ($1, $2, $3, $4, COALESCE($5, TRUE), $6, $7, $8)
      `,
      [
        id,
        input.code.trim().toUpperCase(),
        input.discountType,
        input.discountValue,
        input.active ?? true,
        input.maxUses ?? null,
        input.validFrom ?? null,
        input.validUntil ?? null,
      ],
    );
    return id;
  },

  async updateCoupon(
    id: string,
    input: Partial<{
      code: string;
      discountType: CouponRecord["discountType"];
      discountValue: number;
      active: boolean;
      maxUses: number | null;
      validFrom: string | null;
      validUntil: string | null;
    }>,
    executor: Queryable = { query },
  ) {
    const cur = await executor.query<{
      code: string;
      discount_type: string;
      discount_value: string;
      active: boolean;
      max_uses: number | null;
      valid_from: Date | null;
      valid_until: Date | null;
    }>(
      `SELECT code, discount_type, discount_value, active, max_uses, valid_from, valid_until FROM coupons WHERE id = $1`,
      [id],
    );
    const row = cur.rows[0];
    if (!row) {
      return;
    }
    const code = input.code !== undefined ? input.code.trim().toUpperCase() : row.code;
    const discountType = (input.discountType !== undefined ? input.discountType : row.discount_type) as CouponRecord["discountType"];
    const discountValue = input.discountValue !== undefined ? input.discountValue : Number(row.discount_value);
    const active = input.active !== undefined ? input.active : row.active;
    const maxUses = input.maxUses !== undefined ? input.maxUses : row.max_uses;
    const validFrom =
      input.validFrom !== undefined ? input.validFrom : row.valid_from ? new Date(row.valid_from).toISOString() : null;
    const validUntil =
      input.validUntil !== undefined ? input.validUntil : row.valid_until ? new Date(row.valid_until).toISOString() : null;
    await executor.query(
      `
        UPDATE coupons
        SET code = $2, discount_type = $3, discount_value = $4, active = $5, max_uses = $6, valid_from = $7, valid_until = $8
        WHERE id = $1
      `,
      [id, code, discountType, discountValue, active, maxUses, validFrom, validUntil],
    );
  },

  async deleteCoupon(id: string, executor: Queryable = { query }) {
    await executor.query(`DELETE FROM coupons WHERE id = $1`, [id]);
  },
};
