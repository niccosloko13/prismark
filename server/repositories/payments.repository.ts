import crypto from "node:crypto";

import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";
import type { PaymentMethod, PaymentRecord, PaymentStatus, PaymentWithOrderRecord } from "@/types";

interface PaymentRow extends QueryResultRow {
  id: string;
  order_id: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatus;
  txid: string;
  pix_copy_paste: string | null;
  proof_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  confirmed_at: Date | string | null;
  cancelled_at: Date | string | null;
}

interface PaymentWithOrderRow extends PaymentRow {
  order_label: string;
  order_client_name: string;
  order_client_email: string;
  order_client_phone: string | null;
  order_status: string;
  order_product_name: string;
  order_quantity: number;
  order_value_total: string | number;
  order_created_at: Date | string;
  order_deadline: string;
  order_material: string;
  order_finishing: string;
  order_width_cm: string | number;
  order_height_cm: string | number;
  order_area_m2: string | number;
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    txid: row.txid,
    pixCopyPaste: row.pix_copy_paste,
    proofUrl: row.proof_url,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : null,
  };
}

function mapPaymentWithOrder(row: PaymentWithOrderRow): PaymentWithOrderRecord {
  return {
    ...mapPayment(row),
    order: {
      id: row.order_label,
      clientName: row.order_client_name,
      clientEmail: row.order_client_email,
      clientPhone: row.order_client_phone,
      status: row.order_status as PaymentWithOrderRecord["order"]["status"],
      productName: row.order_product_name,
      value: Number(row.order_value_total),
      createdAt: new Date(row.order_created_at).toISOString(),
      deadline: row.order_deadline,
      material: row.order_material,
      finishing: row.order_finishing,
      measures: {
        quantity: Number(row.order_quantity),
        width: Number(row.order_width_cm),
        height: Number(row.order_height_cm),
        area: Number(row.order_area_m2),
      },
    },
  };
}

export const paymentsRepository = {
  async findById(paymentId: string, executor: Queryable = { query }) {
    const result = await executor.query<PaymentRow>(
      `
        SELECT
          id,
          order_id,
          amount,
          method,
          status,
          txid,
          pix_copy_paste,
          proof_url,
          created_at,
          updated_at,
          confirmed_at,
          cancelled_at
        FROM payments
        WHERE id = $1
        LIMIT 1
      `,
      [paymentId],
    );

    return result.rows[0] ? mapPayment(result.rows[0]) : null;
  },

  async findPendingByOrderId(orderId: string, executor: Queryable = { query }) {
    const result = await executor.query<PaymentRow>(
      `
        SELECT
          id,
          order_id,
          amount,
          method,
          status,
          txid,
          pix_copy_paste,
          proof_url,
          created_at,
          updated_at,
          confirmed_at,
          cancelled_at
        FROM payments
        WHERE order_id = $1 AND method = 'PIX_MANUAL' AND status = 'PENDING'
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [orderId],
    );

    return result.rows[0] ? mapPayment(result.rows[0]) : null;
  },

  async create(
    input: {
      orderId: string;
      amount: number;
      method: PaymentMethod;
      status: PaymentStatus;
      txid: string;
      pixCopyPaste: string | null;
      proofUrl: string | null;
    },
    executor: Queryable = { query },
  ) {
    const id = `pay_${crypto.randomUUID()}`;

    await executor.query(
      `
        INSERT INTO payments (
          id,
          order_id,
          amount,
          method,
          status,
          txid,
          pix_copy_paste,
          proof_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [id, input.orderId, input.amount, input.method, input.status, input.txid, input.pixCopyPaste, input.proofUrl],
    );

    return paymentsRepository.findById(id, executor);
  },

  async listPending(executor: Queryable = { query }) {
    const result = await executor.query<PaymentWithOrderRow>(
      `
        SELECT
          p.id,
          p.order_id,
          p.amount,
          p.method,
          p.status,
          p.txid,
          p.pix_copy_paste,
          p.proof_url,
          p.created_at,
          p.updated_at,
          p.confirmed_at,
          p.cancelled_at,
          o.id AS order_label,
          u.name AS order_client_name,
          u.email AS order_client_email,
          u.phone AS order_client_phone,
          o.status AS order_status,
          o.product_name AS order_product_name,
          o.quantity AS order_quantity,
          o.value_total AS order_value_total,
          o.created_at AS order_created_at,
          o.deadline AS order_deadline,
          o.material AS order_material,
          o.finishing AS order_finishing,
          o.width_cm AS order_width_cm,
          o.height_cm AS order_height_cm,
          o.area_m2 AS order_area_m2
        FROM payments p
        INNER JOIN orders o ON o.id = p.order_id
        INNER JOIN users u ON u.id = o.client_id
        WHERE p.method = 'PIX_MANUAL' AND p.status = 'PENDING'
        ORDER BY p.created_at ASC
      `,
    );

    return result.rows.map(mapPaymentWithOrder);
  },

  async updateStatus(
    paymentId: string,
    input: { status: PaymentStatus; confirmedAt?: Date | null; cancelledAt?: Date | null },
    executor: Queryable = { query },
  ) {
    await executor.query(
      `
        UPDATE payments
        SET
          status = $2,
          confirmed_at = $3,
          cancelled_at = $4,
          updated_at = NOW()
        WHERE id = $1
      `,
      [paymentId, input.status, input.confirmedAt ?? null, input.cancelledAt ?? null],
    );

    return paymentsRepository.findById(paymentId, executor);
  },
};
