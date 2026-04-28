import crypto from "node:crypto";

import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";
import type { PaymentSettingsRecord, PixKeyType } from "@/types";

interface PaymentSettingsRow extends QueryResultRow {
  id: string;
  pix_enabled: boolean;
  pix_key: string | null;
  pix_key_type: PixKeyType | null;
  pix_receiver_name: string | null;
  pix_receiver_city: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapPaymentSettings(row: PaymentSettingsRow): PaymentSettingsRecord {
  return {
    id: row.id,
    pixEnabled: row.pix_enabled,
    pixKey: row.pix_key,
    pixKeyType: row.pix_key_type,
    pixReceiverName: row.pix_receiver_name,
    pixReceiverCity: row.pix_receiver_city,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export const paymentSettingsRepository = {
  async get(executor: Queryable = { query }) {
    const result = await executor.query<PaymentSettingsRow>(
      `
        SELECT
          id,
          pix_enabled,
          pix_key,
          pix_key_type,
          pix_receiver_name,
          pix_receiver_city,
          created_at,
          updated_at
        FROM payment_settings
        ORDER BY created_at ASC
        LIMIT 1
      `,
    );

    return result.rows[0] ? mapPaymentSettings(result.rows[0]) : null;
  },

  async upsert(
    input: {
      pixEnabled: boolean;
      pixKey: string | null;
      pixKeyType: PixKeyType | null;
      pixReceiverName: string | null;
      pixReceiverCity: string | null;
    },
    executor: Queryable = { query },
  ) {
    const existing = await paymentSettingsRepository.get(executor);
    const id = existing?.id ?? `payset_${crypto.randomUUID()}`;

    await executor.query(
      `
        INSERT INTO payment_settings (
          id,
          pix_enabled,
          pix_key,
          pix_key_type,
          pix_receiver_name,
          pix_receiver_city
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id)
        DO UPDATE SET
          pix_enabled = EXCLUDED.pix_enabled,
          pix_key = EXCLUDED.pix_key,
          pix_key_type = EXCLUDED.pix_key_type,
          pix_receiver_name = EXCLUDED.pix_receiver_name,
          pix_receiver_city = EXCLUDED.pix_receiver_city,
          updated_at = NOW()
      `,
      [id, input.pixEnabled, input.pixKey, input.pixKeyType, input.pixReceiverName, input.pixReceiverCity],
    );

    return paymentSettingsRepository.get(executor);
  },
};
