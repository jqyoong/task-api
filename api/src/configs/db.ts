import type { Options, PostgresType } from 'postgres';
import type { Knex } from 'knex';

import nconf from 'nconf';

type DrizzleConfigConnection = Options<Record<string, PostgresType>>;

export type Drizzle_DbConfig = {
  primary: {
    connection: DrizzleConfigConnection;
  };
  replicas: DrizzleConfigConnection[];
};
export type Knex_DbConfig = {
  primary: Knex.Config;
};

const KNEX_DBCONFIG: Knex_DbConfig = {
  primary: {
    client: 'pg',
    connection: {
      host: nconf.get('DB_PRIMARY_HOST'),
      user: nconf.get('DB_PRIMARY_USERNAME'),
      password: nconf.get('DB_PRIMARY_PASSWORD'),
      database: nconf.get('DB_NAME'),
    },
    pool: {
      min: 0,
      max: 1,
    },
    debug: nconf.get('ENABLE_DB_DEBUGGING') || false,
  },
};

const DRIZZLE_DBCONFIG: Drizzle_DbConfig = {
  primary: {
    connection: {
      host: nconf.get('DB_PRIMARY_HOST'),
      port: nconf.get('DB_PRIMARY_HOST_PORT') || 5432,
      user: nconf.get('DB_PRIMARY_USERNAME'),
      password: nconf.get('DB_PRIMARY_PASSWORD'),
      database: nconf.get('DB_NAME'),
      max: +nconf.get('DB_CONNECTION_LIMIT'),
      debug: nconf.get('ENABLE_DB_DEBUGGING') || false,
    },
  },
  replicas: [
    {
      host: nconf.get('DB_PRIMARY_HOST'),
      port: nconf.get('DB_PRIMARY_HOST_PORT') || 5432,
      user: nconf.get('DB_PRIMARY_USERNAME'),
      password: nconf.get('DB_PRIMARY_PASSWORD'),
      database: nconf.get('DB_NAME'),
      max: +nconf.get('DB_CONNECTION_LIMIT'),
      debug: nconf.get('ENABLE_DB_DEBUGGING') || false,
    },
  ],
};

export { DRIZZLE_DBCONFIG, KNEX_DBCONFIG };
