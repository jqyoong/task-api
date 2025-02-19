import type { DBInstance } from '@models/pgsql';

import { Configurations } from '@models/pgsql/schemas';
import BaseRepository from '@repos/base.repo';

const tableName = 'Configurations';
type schema = typeof Configurations;

class ConfigurationsRepo extends BaseRepository<schema, typeof tableName> {
  constructor(db: DBInstance | null | undefined) {
    if (!db) return;
    super({ db, table: Configurations, tableName, softDelete: true });
  }
}

export default ConfigurationsRepo;
