import crypto from "node:crypto";

import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";
import type {
  OrderAuditLogEntry,
  OrderRecord,
  OrderStatus,
  OrderStatusHistoryEntry,
  StoredFile,
} from "@/types";

interface OrderRow extends QueryResultRow {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  product_slug: string;
  product_name: string;
  width_cm: string | number;
  height_cm: string | number;
  area_m2: string | number;
  quantity: number;
  material: string;
  finishing: string;
  deadline: string;
  value_total: string | number;
  status: OrderStatus;
  notes: string | null;
  admin_notes?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  file_id: string | null;
  file_original_name: string | null;
  file_stored_name: string | null;
  file_mime_type: string | null;
  file_size_bytes: string | number | null;
  file_uploaded_by_user_id: string | null;
  file_created_at: Date | string | null;
}

interface StatusHistoryRow extends QueryResultRow {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by_user_id: string;
  changed_by_name: string | null;
  note: string | null;
  created_at: Date | string;
}

interface OrderEventRow extends QueryResultRow {
  id: string;
  order_id: string;
  action: string;
  actor_user_id: string;
  actor_name: string | null;
  payload: Record<string, unknown>;
  created_at: Date | string;
}

function mapOptionalFile(row: OrderRow): StoredFile | null {
  if (!row.file_id || !row.file_original_name || !row.file_stored_name || !row.file_mime_type || !row.file_created_at) {
    return null;
  }

  return {
    id: row.file_id,
    orderId: row.id,
    originalName: row.file_original_name,
    storedName: row.file_stored_name,
    url: `/api/files/${row.file_id}`,
    size: Number(row.file_size_bytes ?? 0),
    mimeType: row.file_mime_type,
    uploadedByUserId: row.file_uploaded_by_user_id ?? undefined,
    createdAt: new Date(row.file_created_at).toISOString(),
  };
}

function mapOrder(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    productSlug: row.product_slug,
    productName: row.product_name,
    measures: {
      width: Number(row.width_cm),
      height: Number(row.height_cm),
      area: Number(row.area_m2),
      quantity: Number(row.quantity),
    },
    material: row.material,
    finishing: row.finishing,
    deadline: row.deadline,
    value: Number(row.value_total),
    status: row.status,
    notes: row.notes,
    adminNotes: row.admin_notes ?? null,
    file: mapOptionalFile(row),
    statusHistory: [],
    auditLogs: [],
  };
}

function mapStatusHistory(row: StatusHistoryRow): OrderStatusHistoryEntry {
  return {
    id: row.id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedByUserId: row.changed_by_user_id,
    changedByName: row.changed_by_name,
    note: row.note,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapAuditLog(row: OrderEventRow): OrderAuditLogEntry {
  return {
    id: row.id,
    action: row.action,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    payload: row.payload ?? {},
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function fetchOrders(whereSql: string, params: unknown[], executor: Queryable = { query }) {
  const result = await executor.query<OrderRow>(
    `
      SELECT
        o.id,
        o.client_id,
        u.name AS client_name,
        u.email AS client_email,
        u.phone AS client_phone,
        o.product_slug,
        o.product_name,
        o.width_cm,
        o.height_cm,
        o.area_m2,
        o.quantity,
        o.material,
        o.finishing,
        o.deadline,
        o.value_total,
        o.status,
        o.notes,
        o.admin_notes,
        o.created_at,
        o.updated_at,
        f.id AS file_id,
        f.original_name AS file_original_name,
        f.stored_name AS file_stored_name,
        f.mime_type AS file_mime_type,
        f.size_bytes AS file_size_bytes,
        f.uploaded_by_user_id AS file_uploaded_by_user_id,
        f.created_at AS file_created_at
      FROM orders o
      INNER JOIN users u ON u.id = o.client_id
      LEFT JOIN files f ON f.order_id = o.id
      ${whereSql}
      ORDER BY o.created_at DESC
    `,
    params,
  );

  const orders = result.rows.map(mapOrder);
  await hydrateHistoryAndLogs(orders, executor);
  return orders;
}

async function hydrateHistoryAndLogs(orders: OrderRecord[], executor: Queryable = { query }) {
  if (orders.length === 0) {
    return orders;
  }

  const orderIds = orders.map((order) => order.id);

  const [historyResult, auditResult] = await Promise.all([
    executor.query<StatusHistoryRow>(
      `
        SELECT h.id, h.order_id, h.from_status, h.to_status, h.changed_by_user_id, u.name AS changed_by_name, h.note, h.created_at
        FROM order_status_history h
        INNER JOIN users u ON u.id = h.changed_by_user_id
        WHERE h.order_id = ANY($1::text[])
        ORDER BY h.created_at DESC
      `,
      [orderIds],
    ),
    executor.query<OrderEventRow>(
      `
        SELECT e.id, e.order_id, e.action, e.actor_user_id, u.name AS actor_name, e.payload, e.created_at
        FROM order_events e
        INNER JOIN users u ON u.id = e.actor_user_id
        WHERE e.order_id = ANY($1::text[])
        ORDER BY e.created_at DESC
      `,
      [orderIds],
    ),
  ]);

  const historyByOrderId = new Map<string, OrderStatusHistoryEntry[]>();
  const logsByOrderId = new Map<string, OrderAuditLogEntry[]>();

  for (const row of historyResult.rows) {
    const current = historyByOrderId.get(row.order_id) ?? [];
    current.push(mapStatusHistory(row));
    historyByOrderId.set(row.order_id, current);
  }

  for (const row of auditResult.rows) {
    const current = logsByOrderId.get(row.order_id) ?? [];
    current.push(mapAuditLog(row));
    logsByOrderId.set(row.order_id, current);
  }

  for (const order of orders) {
    order.statusHistory = historyByOrderId.get(order.id) ?? [];
    order.auditLogs = logsByOrderId.get(order.id) ?? [];
  }

  return orders;
}

export const ordersRepository = {
  async findAll(executor: Queryable = { query }) {
    return fetchOrders("", [], executor);
  },

  async findByClientId(clientId: string, executor: Queryable = { query }) {
    return fetchOrders("WHERE o.client_id = $1", [clientId], executor);
  },

  async findById(orderId: string, executor: Queryable = { query }) {
    const orders = await fetchOrders("WHERE o.id = $1", [orderId], executor);
    return orders[0] ?? null;
  },

  async nextOrderId(executor: Queryable = { query }) {
    const result = await executor.query<{ id: string }>(
      `SELECT 'PRM-' || nextval('order_code_seq') AS id`,
    );
    return result.rows[0].id;
  },

  async create(
    input: {
      id: string;
      clientId: string;
      productSlug: string;
      productName: string;
      widthCm: number;
      heightCm: number;
      areaM2: number;
      quantity: number;
      material: string;
      finishing: string;
      deadline: string;
      valueTotal: number;
      status: OrderStatus;
      notes?: string | null;
    },
    executor: Queryable = { query },
  ) {
    await executor.query(
      `
        INSERT INTO orders (
          id, client_id, product_slug, product_name, width_cm, height_cm, area_m2, quantity,
          material, finishing, deadline, value_total, status, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
      [
        input.id,
        input.clientId,
        input.productSlug,
        input.productName,
        input.widthCm,
        input.heightCm,
        input.areaM2,
        input.quantity,
        input.material,
        input.finishing,
        input.deadline,
        input.valueTotal,
        input.status,
        input.notes ?? null,
      ],
    );

    return ordersRepository.findById(input.id, executor);
  },

  async updateStatus(orderId: string, status: OrderStatus, executor: Queryable = { query }) {
    await executor.query(
      `
        UPDATE orders
        SET status = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [orderId, status],
    );

    return ordersRepository.findById(orderId, executor);
  },

  async updateAdminNotes(orderId: string, adminNotes: string | null, executor: Queryable = { query }) {
    await executor.query(
      `
        UPDATE orders
        SET admin_notes = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [orderId, adminNotes],
    );

    return ordersRepository.findById(orderId, executor);
  },

  async createStatusHistory(
    input: {
      orderId: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      changedByUserId: string;
      note?: string | null;
    },
    executor: Queryable = { query },
  ) {
    const id = `hst_${crypto.randomUUID()}`;
    await executor.query(
      `
        INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by_user_id, note)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [id, input.orderId, input.fromStatus, input.toStatus, input.changedByUserId, input.note ?? null],
    );
    return id;
  },

  async createAuditLog(
    input: {
      orderId: string;
      action: string;
      actorUserId: string;
      payload: Record<string, unknown>;
    },
    executor: Queryable = { query },
  ) {
    const id = `evt_${crypto.randomUUID()}`;
    await executor.query(
      `
        INSERT INTO order_events (id, order_id, action, actor_user_id, payload)
        VALUES ($1, $2, $3, $4, $5::jsonb)
      `,
      [id, input.orderId, input.action, input.actorUserId, JSON.stringify(input.payload)],
    );
    return id;
  },
};
