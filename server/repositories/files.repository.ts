import crypto from "node:crypto";

import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";
import type { StoredFile } from "@/types";

interface FileRow extends QueryResultRow {
  id: string;
  order_id: string | null;
  uploaded_by_user_id: string;
  original_name: string;
  stored_name: string;
  storage_driver: string;
  relative_path: string;
  mime_type: string;
  size_bytes: string | number;
  created_at: Date | string;
}

function mapFile(row: FileRow): StoredFile {
  return {
    id: row.id,
    orderId: row.order_id,
    originalName: row.original_name,
    storedName: row.stored_name,
    url: `/api/files/${row.id}`,
    size: Number(row.size_bytes),
    mimeType: row.mime_type,
    relativePath: row.relative_path,
    storageDriver: row.storage_driver,
    uploadedByUserId: row.uploaded_by_user_id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export const filesRepository = {
  async create(
    input: {
      orderId?: string | null;
      uploadedByUserId: string;
      originalName: string;
      storedName: string;
      storageDriver: string;
      relativePath: string;
      mimeType: string;
      sizeBytes: number;
    },
    executor: Queryable = { query },
  ) {
    const id = `fil_${crypto.randomUUID()}`;
    const result = await executor.query<FileRow>(
      `
        INSERT INTO files (
          id, order_id, uploaded_by_user_id, original_name, stored_name,
          storage_driver, relative_path, mime_type, size_bytes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, order_id, uploaded_by_user_id, original_name, stored_name, storage_driver, relative_path, mime_type, size_bytes, created_at
      `,
      [
        id,
        input.orderId ?? null,
        input.uploadedByUserId,
        input.originalName,
        input.storedName,
        input.storageDriver,
        input.relativePath,
        input.mimeType,
        input.sizeBytes,
      ],
    );

    return mapFile(result.rows[0]);
  },

  async attachToOrder(fileId: string, orderId: string, executor: Queryable = { query }) {
    const result = await executor.query<FileRow>(
      `
        UPDATE files
        SET order_id = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, order_id, uploaded_by_user_id, original_name, stored_name, storage_driver, relative_path, mime_type, size_bytes, created_at
      `,
      [fileId, orderId],
    );

    return result.rows[0] ? mapFile(result.rows[0]) : null;
  },

  async findById(fileId: string, executor: Queryable = { query }) {
    const result = await executor.query<FileRow>(
      `
        SELECT id, order_id, uploaded_by_user_id, original_name, stored_name, storage_driver, relative_path, mime_type, size_bytes, created_at
        FROM files
        WHERE id = $1
        LIMIT 1
      `,
      [fileId],
    );

    return result.rows[0] ? mapFile(result.rows[0]) : null;
  },

  async findByIdentifier(identifier: string, executor: Queryable = { query }) {
    const result = await executor.query<FileRow>(
      `
        SELECT id, order_id, uploaded_by_user_id, original_name, stored_name, storage_driver, relative_path, mime_type, size_bytes, created_at
        FROM files
        WHERE id = $1 OR stored_name = $1
        LIMIT 1
      `,
      [identifier],
    );

    return result.rows[0] ? mapFile(result.rows[0]) : null;
  },
};
