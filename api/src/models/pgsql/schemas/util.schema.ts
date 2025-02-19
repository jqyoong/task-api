import { PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { type SQL } from 'drizzle-orm';

export function withPaginationFunc<T extends PgSelect>(qb: T, orderByColumn: PgColumn | SQL | SQL.Aliased, page = 1, pageSize = 20) {
  return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}
