import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

export interface Queryable {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ) => Promise<QueryResult<T>>;
}

export function asQueryable(client: Pool | PoolClient): Queryable {
  return client;
}
