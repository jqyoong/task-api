import type { TablesRelationalConfig, DBQueryConfig, KnownKeysOnly } from 'drizzle-orm';

export type FindFirstConfig<TSchemas extends TablesRelationalConfig, SchemaKey extends keyof TSchemas> = KnownKeysOnly<
  Omit<DBQueryConfig<'many', true, TSchemas, TSchemas[SchemaKey]>, 'limit'>,
  Omit<DBQueryConfig<'many', true, TSchemas, TSchemas[SchemaKey]>, 'limit'>
>;

export type FindManyConfig<TSchemas extends TablesRelationalConfig, SchemaKey extends keyof TSchemas> = KnownKeysOnly<
  DBQueryConfig<'many', true, TSchemas, TSchemas[SchemaKey]>,
  DBQueryConfig<'many', true, TSchemas, TSchemas[SchemaKey]>
>;

export type OrderByColumn<TSchemas> = {
  column: keyof TSchemas;
  orderBy: 'asc' | 'desc';
};

export type PaginationConfig<TSchemas> = {
  limit?: undefined | number;
  offset?: undefined | number;
  orderByColumns?: OrderByColumn<TSchemas>[];
  withCount?: boolean;
};

export type PaginationResponse<T> = {
  collections: T;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};
