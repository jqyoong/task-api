import type { Drizzle_DbConfig } from '@configs/db';

import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import nconf from 'nconf';

import { Configurations } from '@models/pgsql/schemas';
import { withReplicas } from 'drizzle-orm/pg-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';

export const Schemas = {
  Configurations,
};

export type ExtractSchemaTablesWithRelations<T extends Record<string, unknown>> = ExtractTablesWithRelations<T>;
export type TSchemas = ExtractSchemaTablesWithRelations<typeof Schemas>;

export type DBInstance = PostgresJsDatabase<typeof Schemas>;

let DbInstance: DBInstance | null = null;
const init = async ({ dbConns, initAsInstance = false }: { dbConns: Drizzle_DbConfig; initAsInstance?: boolean }) => {
  console.log('INIT DB');

  const primary = drizzle(postgres('', dbConns.primary.connection), {
    schema: Schemas,
    logger: nconf.get('DB_LOG'),
  });
  const replicas = dbConns.replicas.map((config) => {
    return drizzle(postgres('', config), {
      schema: Schemas,
      logger: nconf.get('DB_LOG'),
    });
  });

  const _db = withReplicas(primary, [replicas[0]]);

  if (initAsInstance) {
    return _db;
  }
  DbInstance = _db;
};

const closeDbConns = async () => {};

export { DbInstance, init, closeDbConns };
