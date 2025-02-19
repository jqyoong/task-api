import {
  type InferSelectModel,
  type BuildQueryResult,
  type ExtractTablesWithRelations,
  type KnownKeysOnly,
  type DBQueryConfig,
  getTableColumns,
  getOperators,
  Equal,
  DrizzleTypeError,
  AnyColumn,
  GetColumnData,
} from 'drizzle-orm';

import { type DBInstance, Schemas } from '@models/pgsql';
import {
  type PgTable,
  type PgTableWithColumns,
  type PgUpdateSetSource,
  type PgTransaction,
  SelectedFieldsFlat,
  PgInsertValue,
} from 'drizzle-orm/pg-core';
import { SQL, and, isNull } from 'drizzle-orm/sql';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import cloneDeep from 'lodash.clonedeep';

import { Tracer, Alerts, Logger, DbError } from '@helpers/index';

type SimplifyShallow<T> = {
  [K in keyof T]: T[K];
} & NonNullable<unknown>;
type SelectResultField<T, TDeep extends boolean = true> =
  T extends DrizzleTypeError<string>
    ? T
    : T extends PgTable
      ? Equal<TDeep, true> extends true
        ? SelectResultField<T['_']['columns'], false>
        : never
      : T extends AnyColumn
        ? GetColumnData<T>
        : T extends SQL | SQL.Aliased
          ? T['_']['type']
          : T extends Record<string, unknown>
            ? SelectResultFields<T, true>
            : never;
type SelectResultFields<TSelectedFields, TDeep extends boolean = true> = SimplifyShallow<{
  [Key in keyof TSelectedFields & string]: SelectResultField<TSelectedFields[Key], TDeep>;
}>;

/**
 * The extract tables with relations for primary schemas.
 */
export type ExtractSchemaTablesWithRelations<T extends Record<string, unknown>> = ExtractTablesWithRelations<T>;

export type THasTimeStamps<T extends PgTable> = boolean | [keyof T['_']['columns'] | null, keyof T['_']['columns'] | null];
export type TSoftDelete<T extends PgTable> = boolean | keyof T['_']['columns'];

/**
 * The generic transaction session.
 */
export type Transaction<T extends Record<string, unknown>> = PgTransaction<PostgresJsQueryResultHKT, T, ExtractTablesWithRelations<T>>;

/**
 * The find first query builder config.
 */
export type FindFirstQueryConfig<T extends Record<string, unknown>, U extends keyof ExtractSchemaTablesWithRelations<T>> = Omit<
  DBQueryConfig<'many', true, ExtractSchemaTablesWithRelations<T>, ExtractSchemaTablesWithRelations<T>[U]>,
  'limit'
> & {
  tx?: Transaction<T>;
};

/**
 * The find first query builder config.
 */
export type FindFirstOpts<T extends Record<string, unknown>> = KnownKeysOnly<
  T,
  FindFirstQueryConfig<T, keyof ExtractSchemaTablesWithRelations<T>>
>;

/**
 * The find many query builder config.
 */
export type FindManyQueryConfig<T extends Record<string, unknown>, U extends keyof ExtractSchemaTablesWithRelations<T>> = DBQueryConfig<
  'many',
  true,
  ExtractSchemaTablesWithRelations<T>,
  ExtractSchemaTablesWithRelations<T>[U]
> & {
  tx?: Transaction<T>;
};

/**
 * The options for finding many records.
 */
export type FindManyOpts<T extends Record<string, unknown>> = KnownKeysOnly<
  T,
  FindManyQueryConfig<T, keyof ExtractSchemaTablesWithRelations<T>>
>;

/**
 * The paginate by offset query builder config.
 */
export type PaginateByOffsetQueryConfig<
  T extends Record<string, unknown>,
  U extends keyof ExtractSchemaTablesWithRelations<T>,
> = DBQueryConfig<'many', true, ExtractSchemaTablesWithRelations<T>, ExtractSchemaTablesWithRelations<T>[U]> & {
  page?: number;
  pageSize?: number;
  tx?: Transaction<T>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
abstract class BaseRepository<TSchema extends PgTableWithColumns<any>, U extends keyof ExtractSchemaTablesWithRelations<typeof Schemas>> {
  db: DBInstance;
  table: TSchema;
  #tableName: U;
  hasTimestamps?: THasTimeStamps<TSchema>;
  softDelete?: TSoftDelete<TSchema>;

  constructor({
    db,
    table,
    tableName,
    hasTimestamps,
    softDelete,
  }: {
    db: DBInstance;
    table: TSchema;
    tableName: U;
    hasTimestamps?: THasTimeStamps<TSchema>;
    softDelete?: TSoftDelete<TSchema>;
  }) {
    this.db = db;
    this.table = table;
    this.#tableName = tableName;
    this.hasTimestamps = hasTimestamps;
    this.softDelete = softDelete;
  }

  async modelHandler({
    promise,
    defaultValue = undefined,
    throwError = false,
  }: {
    promise: () => Promise<unknown | undefined>;
    defaultValue?: undefined | unknown;
    throwError?: boolean;
  }): Promise<undefined | unknown | void> {
    try {
      const res = await promise();
      return res;
    } catch (error) {
      console.error(error);
      Logger.debug(error);
      Alerts.captureExceptionsWithScopes({ error, tags: { trace_id: Tracer.getTraceId() } });
      if (throwError) throw new DbError(new Error());
      return defaultValue;
    }
  }

  /**
   * A hook that is invoked right before a row is inserted.
   *
   * @param {InferSelectModel<TSchema>} row
   * @returns {Promise<InferSelectModel<TSchema>>}
   */
  async beforeCreate(row: PgInsertValue<TSchema>): Promise<PgInsertValue<TSchema>> {
    return row;
  }

  /**
   * A hook that is invoked after a row is inserted and right before returning to the caller.
   *
   * @param {InferSelectModel<TSchema>} row
   * @returns {Promise<InferSelectModel<TSchema>>}
   */
  async afterCreate(row: InferSelectModel<TSchema>): Promise<InferSelectModel<TSchema>> {
    return row;
  }

  /**
   * A hook that is invoked after a row is deleted and right before returning to the caller.
   *
   * @param {InferSelectModel<TSchema>} row
   * @returns {Promise<InferSelectModel<TSchema>>}
   */
  async afterDelete(row: InferSelectModel<TSchema>): Promise<InferSelectModel<TSchema>> {
    return row;
  }

  /**
   * A hook that is invoked right before a row is updated.
   *
   * @param {InferSelectModel<TSchema>} row
   * @returns {Promise<InferSelectModel<TSchema>>}
   */
  async beforeUpdate(row: InferSelectModel<TSchema>): Promise<InferSelectModel<TSchema>> {
    return row;
  }

  /**
   * A hook that is invoked after a row is updated and right before returning to the caller.
   *
   * @param {InferSelectModel<TSchema>} row
   * @returns {Promise<InferSelectModel<TSchema>>}
   */
  async afterUpdate(row: InferSelectModel<TSchema>): Promise<InferSelectModel<TSchema>> {
    return row;
  }

  /**
   * A hook that is invoked before to the caller which applies to:
   *
   * - findFirst()
   * - findMany()
   * - paginateByOffset()
   *
   * @param {object} [config] The find first or find many options
   * @returns
   */

  beforeFind<QConfig extends FindFirstQueryConfig<typeof Schemas, U>>(
    config?: FindFirstOpts<QConfig>
  ): Omit<KnownKeysOnly<QConfig, FindFirstQueryConfig<QConfig, keyof ExtractTablesWithRelations<QConfig>>>, 'tx'> | NonNullable<unknown>;
  beforeFind<QConfig extends FindManyQueryConfig<typeof Schemas, U>>(
    config?: FindManyOpts<QConfig>
  ): Omit<KnownKeysOnly<QConfig, FindManyQueryConfig<QConfig, keyof ExtractTablesWithRelations<QConfig>>>, 'tx'> | NonNullable<unknown> {
    if (this.softDelete) {
      const colName = typeof this.softDelete === 'boolean' ? 'deleted_at' : this.softDelete;
      if (typeof config?.where === 'function') {
        const deletedAt = getTableColumns(this.table)[colName];
        const whereChunks = and(config.where(getTableColumns(this.table), getOperators())?.getSQL(), isNull(deletedAt).getSQL());
        config.where = whereChunks;
      }
    }

    return config || {};
  }

  /**
   * A hook that is invoked right before returning to the caller which applies to:
   *
   * - findFirst()
   * - findMany()
   * - paginateByOffset()
   *
   * The common use cases:
   *
   * - post process s3 storage path to a private s3 URL and cache it
   *
   * @param {InferSelectModel<TSchema>} row
   * @returns {Promise<InferSelectModel<TSchema>>}
   */
  async afterFind(row: InferSelectModel<TSchema>) {
    return row;
  }

  /**
   * Insert 1 or multiple values into the database.
   *
   * @param {PgInsertValue<TSchema> | PgInsertValue<TSchema>[]} values The values to insert, can be either object or array.
   * @param {object} [opts] The insert options.
   * @param {object} [opts.fields] The fields to return.
   * @param {Transaction<S>} [opts.tx] The SQL transaction.
   * @returns
   */
  async create<TSelectedFields extends SelectedFieldsFlat>(
    values: PgInsertValue<TSchema> | PgInsertValue<TSchema>[],
    opts: {
      fields: TSelectedFields;
      tx?: Transaction<typeof Schemas>;
    }
  ): Promise<SelectResultFields<TSelectedFields> | SelectResultFields<TSelectedFields>[] | null>;
  async create(
    values: PgInsertValue<TSchema> | PgInsertValue<TSchema>[],
    opts?: { tx?: Transaction<typeof Schemas> }
  ): Promise<InferSelectModel<TSchema> | InferSelectModel<TSchema>[] | null>;
  async create<TSelectedFields extends SelectedFieldsFlat | undefined>(
    values: PgInsertValue<TSchema> | PgInsertValue<TSchema>[],
    opts?: {
      fields?: TSelectedFields;
      tx?: Transaction<typeof Schemas>;
    }
  ) {
    return this.modelHandler({
      throwError: true,
      promise: async () => {
        const isArrayValues = Array.isArray(values);
        let qb;

        // typescript overload signature issue that unable to different out array and object
        if (isArrayValues) {
          qb = (opts?.tx || this.db).insert(this.table).values(values);
        } else {
          qb = (opts?.tx || this.db).insert(this.table).values(values);
        }

        if (opts?.fields) {
          qb.returning(opts?.fields);
        } else {
          qb.returning();
        }

        const rows = await qb;

        if (rows.length < 1) {
          return null;
        }

        const updatedRows = isArrayValues
          ? await Promise.all(rows.map(async (row) => this.afterCreate(row as InferSelectModel<TSchema>)))
          : await this.afterCreate(rows[0] as InferSelectModel<TSchema>);

        return updatedRows;
      },
    });
  }

  /**
   * Update the data rows in the database based on the where condition.
   *
   * @param {PgUpdateSetSource<T>} value The values to update to.
   * @param {object} [opts] The insert options.
   * @param {object} [opts.fields] The fields to return.
   * @param {SQL<unknown>} [opts.where] The SQL where filter.
   * @param {Transaction<S>} [opts.tx] The SQL transaction.
   * @returns
   */
  async update<TSelectedFields extends SelectedFieldsFlat, QConfig extends FindManyQueryConfig<typeof Schemas, U>>(
    value: PgUpdateSetSource<TSchema>,
    opts: {
      fields: TSelectedFields;
      where?: QConfig['where'];
      tx?: Transaction<typeof Schemas>;
    }
  ): Promise<SelectResultFields<TSelectedFields>[]>;
  async update<QConfig extends FindManyQueryConfig<typeof Schemas, U>>(
    value: PgUpdateSetSource<TSchema>,
    opts?: {
      where?: QConfig['where'];
      tx?: Transaction<typeof Schemas>;
    }
  ): Promise<InferSelectModel<TSchema>[]>;
  async update<TSelectedFields extends SelectedFieldsFlat, QConfig extends FindManyQueryConfig<typeof Schemas, U>>(
    value: PgUpdateSetSource<TSchema>,
    opts?: {
      fields?: TSelectedFields;
      where?: QConfig['where'];
      tx?: Transaction<typeof Schemas>;
    }
  ) {
    return this.modelHandler({
      throwError: true,
      promise: async () => {
        let where;
        let _updateValue = cloneDeep(value);

        if (opts?.where) {
          if ('queryChunks' in opts.where) {
            where = opts.where;
          } else if (typeof opts.where === 'function') {
            where = opts.where(getTableColumns(this.table), getOperators());
          }
        }

        if (this.hasTimestamps) {
          const updateField = (Array.isArray(this.hasTimestamps) && this.hasTimestamps?.[1]) || 'updated_at';
          _updateValue = {
            ..._updateValue,
            ...{
              [updateField]: new Date(),
            },
          };
        }

        const qb = (opts?.tx || this.db).update(this.table).set(_updateValue).where(where);

        if (opts?.fields) {
          qb.returning(opts?.fields);
        } else {
          qb.returning();
        }

        const rows = await qb;
        if (rows.length < 1) {
          return [];
        }

        const updatedRows = await Promise.all(rows.map(async (row) => this.afterUpdate(row as InferSelectModel<TSchema>)));

        return updatedRows;
      },
    }) as unknown as BuildQueryResult<ExtractTablesWithRelations<typeof Schemas>, ExtractTablesWithRelations<typeof Schemas>[U], QConfig>[];
  }

  /**
   * Delete the data rows in the database based on the where condition.
   *
   * @param {object} [opts] The insert options.
   * @param {object} [opts.fields] The fields to return.
   * @param {SQL<unknown>} [opts.where] The SQL where filter.
   * @param {Transaction<S>} [opts.tx] The SQL transaction.
   * @returns
   */
  async delete<TSelectedFields extends SelectedFieldsFlat, QConfig extends FindManyQueryConfig<typeof Schemas, U>>(opts: {
    fields: TSelectedFields;
    where?: QConfig['where'];
    tx?: Transaction<typeof Schemas>;
  }): Promise<SelectResultFields<TSelectedFields>[] | null>;
  async delete<QConfig extends FindManyQueryConfig<typeof Schemas, U>>(opts?: {
    where?: QConfig['where'];
    tx?: Transaction<typeof Schemas>;
  }): Promise<InferSelectModel<TSchema>[] | null>;
  async delete<TSelectedFields extends SelectedFieldsFlat, QConfig extends FindManyQueryConfig<typeof Schemas, U>>(opts?: {
    fields?: TSelectedFields;
    where?: QConfig['where'];
    tx?: Transaction<typeof Schemas>;
  }) {
    return this.modelHandler({
      throwError: true,
      promise: async () => {
        let where;
        if (opts?.where) {
          if ('queryChunks' in opts.where) {
            where = opts.where;
          } else if (typeof opts.where === 'function') {
            where = opts.where(getTableColumns(this.table), getOperators());
          }
        }

        const qb = (opts?.tx || this.db).delete(this.table).where(where);

        if (opts?.fields) {
          qb.returning(opts?.fields);
        } else {
          qb.returning();
        }

        const rows = await qb;

        if (rows.length < 1) {
          return [];
        }

        const deletedRows = await Promise.all(rows.map(async (row) => this.afterDelete(row as InferSelectModel<TSchema>)));

        return deletedRows;
      },
    }) as unknown as
      | BuildQueryResult<ExtractTablesWithRelations<typeof Schemas>, ExtractTablesWithRelations<typeof Schemas>[U], QConfig>[]
      | null;
  }

  /**
   * Return the 1st record based on the config.
   *
   * @param {FindFirstOpts<QConfig>} [opts] The find first options.
   * @param {object} [opts.columns] The columns to select.
   * @param {object} [opts.extras] The extras columns to return.
   * @param {object} [opts.offset] The offset of the returned rows.
   * @param {object} [opts.orderBy] The sorting order.
   * @param {SQL<unknown>} [opts.where] The where filter.
   * @param {object} [opts.with] The relations to include in query.
   * @param {Transaction<S>} [opts.tx] The SQL transaction.
   * @returns
   */
  async findFirst<QConfig extends FindFirstQueryConfig<typeof Schemas, U>>(opts?: FindFirstOpts<QConfig>) {
    return this.modelHandler({
      promise: async () => {
        const { tx, ...config } = opts || {};
        const _config = this.beforeFind(config || {});
        const row = await (tx || this.db).query[this.#tableName].findFirst(_config);

        if (!row) {
          return row;
        }

        const updatedRow = await this.afterFind(row as unknown as InferSelectModel<TSchema>);
        return updatedRow;
      },
    }) as unknown as BuildQueryResult<ExtractTablesWithRelations<typeof Schemas>, ExtractTablesWithRelations<typeof Schemas>[U], QConfig>;
  }

  /**
   * Return all the records based on the config.
   *
   * @param {FindManyOpts<QConfig>} [opts] The find many options.
   * @param {object} [opts.columns] The columns to select.
   * @param {object} [opts.extras] The extras columns to return.
   * @param {object} [opts.limit] The limit number of the returned rows.
   * @param {object} [opts.offset] The offset of the returned rows.
   * @param {object} [opts.orderBy] The sorting order.
   * @param {SQL<unknown>} [opts.where] The where filter.
   * @param {object} [opts.with] The relations to include in query.
   * @param {Transaction<S>} [opts.tx] The SQL transaction.
   * @returns
   */
  async findMany<QConfig extends FindManyQueryConfig<typeof Schemas, U>>(opts?: FindManyOpts<QConfig>) {
    return this.modelHandler({
      promise: async () => {
        const { tx, ...config } = opts || {};
        const _config = this.beforeFind(config || {});
        const rows = await (tx || this.db).query[this.#tableName].findMany(_config);

        if (!rows || rows.length < 1) {
          return [];
        }

        const updatedRow = await this.afterFind(rows as InferSelectModel<TSchema>);
        return updatedRow;
      },
    }) as unknown as BuildQueryResult<ExtractTablesWithRelations<typeof Schemas>, ExtractTablesWithRelations<typeof Schemas>[U], QConfig>[];
  }
}

export default BaseRepository;
