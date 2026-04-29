import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";

export interface ProductOverride {
  productSlug: string;
  isActive: boolean;
  basePriceM2: number | null;
  featured: boolean | null;
}

interface Row extends QueryResultRow {
  product_slug: string;
  is_active: boolean;
  base_price_m2: string | null;
  featured: boolean | null;
}

function mapRow(row: Row): ProductOverride {
  return {
    productSlug: row.product_slug,
    isActive: row.is_active,
    basePriceM2: row.base_price_m2 != null ? Number(row.base_price_m2) : null,
    featured: row.featured,
  };
}

export const productOverridesRepository = {
  async listAll(executor: Queryable = { query }): Promise<ProductOverride[]> {
    const result = await executor.query<Row>(`SELECT product_slug, is_active, base_price_m2, featured FROM product_overrides`);
    return result.rows.map(mapRow);
  },

  async upsert(
    input: {
      productSlug: string;
      isActive: boolean;
      basePriceM2: number | null;
      featured: boolean | null;
    },
    executor: Queryable = { query },
  ) {
    await executor.query(
      `
        INSERT INTO product_overrides (product_slug, is_active, base_price_m2, featured)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_slug) DO UPDATE SET
          is_active = EXCLUDED.is_active,
          base_price_m2 = EXCLUDED.base_price_m2,
          featured = EXCLUDED.featured,
          updated_at = NOW()
      `,
      [input.productSlug, input.isActive, input.basePriceM2, input.featured],
    );
  },
};
