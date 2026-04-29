import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";

export interface SiteSettingsRecord {
  id: string;
  legalName: string | null;
  brandName: string | null;
  addressLine: string | null;
  cityState: string | null;
  postalCode: string | null;
  phoneDisplay: string | null;
  phoneDigits: string | null;
  email: string | null;
  shortTrustLine: string | null;
  supportLine: string | null;
  shippingFreeMinBrl: number | null;
  pixDiscountPercent: number | null;
  siteWhatsappDigits: string | null;
  updatedAt: string;
}

interface Row extends QueryResultRow {
  id: string;
  legal_name: string | null;
  brand_name: string | null;
  address_line: string | null;
  city_state: string | null;
  postal_code: string | null;
  phone_display: string | null;
  phone_digits: string | null;
  email: string | null;
  short_trust_line: string | null;
  support_line: string | null;
  shipping_free_min_brl: string | null;
  pix_discount_percent: string | null;
  site_whatsapp_digits: string | null;
  updated_at: Date | string;
}

function mapRow(row: Row): SiteSettingsRecord {
  return {
    id: row.id,
    legalName: row.legal_name,
    brandName: row.brand_name,
    addressLine: row.address_line,
    cityState: row.city_state,
    postalCode: row.postal_code,
    phoneDisplay: row.phone_display,
    phoneDigits: row.phone_digits,
    email: row.email,
    shortTrustLine: row.short_trust_line,
    supportLine: row.support_line,
    shippingFreeMinBrl: row.shipping_free_min_brl != null ? Number(row.shipping_free_min_brl) : null,
    pixDiscountPercent: row.pix_discount_percent != null ? Number(row.pix_discount_percent) : null,
    siteWhatsappDigits: row.site_whatsapp_digits,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export const siteSettingsRepository = {
  async get(executor: Queryable = { query }): Promise<SiteSettingsRecord | null> {
    const result = await executor.query<Row>(
      `
        SELECT *
        FROM site_settings
        WHERE id = 'default'
        LIMIT 1
      `,
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async upsert(
    input: Partial<
      Omit<SiteSettingsRecord, "id" | "updatedAt"> & {
        legalName?: string | null;
        brandName?: string | null;
        addressLine?: string | null;
        cityState?: string | null;
        postalCode?: string | null;
        phoneDisplay?: string | null;
        phoneDigits?: string | null;
        email?: string | null;
        shortTrustLine?: string | null;
        supportLine?: string | null;
        shippingFreeMinBrl?: number | null;
        pixDiscountPercent?: number | null;
        siteWhatsappDigits?: string | null;
      }
    >,
    executor: Queryable = { query },
  ): Promise<SiteSettingsRecord> {
    const current = await siteSettingsRepository.get(executor);
    const merged = {
      legal_name: input.legalName ?? current?.legalName ?? null,
      brand_name: input.brandName ?? current?.brandName ?? null,
      address_line: input.addressLine ?? current?.addressLine ?? null,
      city_state: input.cityState ?? current?.cityState ?? null,
      postal_code: input.postalCode ?? current?.postalCode ?? null,
      phone_display: input.phoneDisplay ?? current?.phoneDisplay ?? null,
      phone_digits: input.phoneDigits ?? current?.phoneDigits ?? null,
      email: input.email ?? current?.email ?? null,
      short_trust_line: input.shortTrustLine ?? current?.shortTrustLine ?? null,
      support_line: input.supportLine ?? current?.supportLine ?? null,
      shipping_free_min_brl: input.shippingFreeMinBrl ?? current?.shippingFreeMinBrl ?? null,
      pix_discount_percent: input.pixDiscountPercent ?? current?.pixDiscountPercent ?? 15,
      site_whatsapp_digits: input.siteWhatsappDigits ?? current?.siteWhatsappDigits ?? null,
    };

    const result = await executor.query<Row>(
      `
        INSERT INTO site_settings (
          id, legal_name, brand_name, address_line, city_state, postal_code,
          phone_display, phone_digits, email, short_trust_line, support_line,
          shipping_free_min_brl, pix_discount_percent, site_whatsapp_digits
        )
        VALUES (
          'default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT (id) DO UPDATE SET
          legal_name = EXCLUDED.legal_name,
          brand_name = EXCLUDED.brand_name,
          address_line = EXCLUDED.address_line,
          city_state = EXCLUDED.city_state,
          postal_code = EXCLUDED.postal_code,
          phone_display = EXCLUDED.phone_display,
          phone_digits = EXCLUDED.phone_digits,
          email = EXCLUDED.email,
          short_trust_line = EXCLUDED.short_trust_line,
          support_line = EXCLUDED.support_line,
          shipping_free_min_brl = EXCLUDED.shipping_free_min_brl,
          pix_discount_percent = EXCLUDED.pix_discount_percent,
          site_whatsapp_digits = EXCLUDED.site_whatsapp_digits,
          updated_at = NOW()
        RETURNING *
      `,
      [
        merged.legal_name,
        merged.brand_name,
        merged.address_line,
        merged.city_state,
        merged.postal_code,
        merged.phone_display,
        merged.phone_digits,
        merged.email,
        merged.short_trust_line,
        merged.support_line,
        merged.shipping_free_min_brl,
        merged.pix_discount_percent,
        merged.site_whatsapp_digits,
      ],
    );

    return mapRow(result.rows[0]);
  },
};
