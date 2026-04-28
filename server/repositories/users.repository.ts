import crypto from "node:crypto";

import type { QueryResultRow } from "pg";

import { query } from "@/server/db";
import type { Queryable } from "@/server/db/queryable";
import type { AppUser, AuthProvider } from "@/types";

interface UserRow extends QueryResultRow {
  id: string;
  username: string | null;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: AppUser["role"];
  auth_provider: AuthProvider;
  google_sub: string | null;
  avatar_url: string | null;
  password_hash: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapUser(row: UserRow): AppUser {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    company: row.company,
    phone: row.phone,
    role: row.role,
    authProvider: row.auth_provider,
    googleSub: row.google_sub,
    avatarUrl: row.avatar_url,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export const usersRepository = {
  async findAll(executor: Queryable = { query }) {
    const result = await executor.query<UserRow>(
      `
        SELECT id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `,
    );

    return result.rows.map(mapUser);
  },

  async findByEmail(email: string, executor: Queryable = { query }) {
    const result = await executor.query<UserRow>(
      `
        SELECT id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email.toLowerCase()],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async findById(id: string, executor: Queryable = { query }) {
    const result = await executor.query<UserRow>(
      `
        SELECT id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async findByGoogleSub(googleSub: string, executor: Queryable = { query }) {
    const result = await executor.query<UserRow>(
      `
        SELECT id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
        FROM users
        WHERE google_sub = $1
        LIMIT 1
      `,
      [googleSub],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async findByUsername(username: string, executor: Queryable = { query }) {
    const result = await executor.query<UserRow>(
      `
        SELECT id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
        FROM users
        WHERE username = $1
        LIMIT 1
      `,
      [username.toLowerCase()],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async create(
    input: {
      username?: string | null;
      name: string;
      email: string;
      company: string;
      phone: string;
      role: AppUser["role"];
      passwordHash: string;
      authProvider?: AuthProvider;
      googleSub?: string | null;
      avatarUrl?: string | null;
    },
    executor: Queryable = { query },
  ) {
    const id = `usr_${crypto.randomUUID()}`;
    const result = await executor.query<UserRow>(
      `
        INSERT INTO users (id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
      `,
      [
        id,
        input.username?.toLowerCase() ?? null,
        input.name,
        input.email.toLowerCase(),
        input.company,
        input.phone,
        input.role,
        input.authProvider ?? "credentials",
        input.googleSub ?? null,
        input.avatarUrl ?? null,
        input.passwordHash,
      ],
    );

    return mapUser(result.rows[0]);
  },

  async linkGoogleAccount(
    input: {
      userId: string;
      googleSub: string;
      avatarUrl?: string | null;
    },
    executor: Queryable = { query },
  ) {
    const result = await executor.query<UserRow>(
      `
        UPDATE users
        SET google_sub = $2,
            avatar_url = COALESCE($3, avatar_url),
            auth_provider = CASE
              WHEN auth_provider = 'credentials' THEN 'hybrid'
              ELSE auth_provider
            END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
      `,
      [input.userId, input.googleSub, input.avatarUrl ?? null],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },

  async refreshGoogleProfile(
    input: {
      userId: string;
      avatarUrl?: string | null;
    },
    executor: Queryable = { query },
  ) {
    const result = await executor.query<UserRow>(
      `
        UPDATE users
        SET avatar_url = COALESCE($2, avatar_url),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, username, name, email, company, phone, role, auth_provider, google_sub, avatar_url, password_hash, created_at, updated_at
      `,
      [input.userId, input.avatarUrl ?? null],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },
};
