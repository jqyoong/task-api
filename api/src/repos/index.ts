import type { DBInstance } from '@models/pgsql';

import { DbInstance } from '@models/pgsql/index';
import ConfigurationRepo from '@repos/configurations.repo';

type Repositories = {
  db?: DBInstance;
  Configuration?: ConfigurationRepo;
};

const repos: Repositories = {};
export const init = async () => {
  repos.db = DbInstance!;
  repos.Configuration = new ConfigurationRepo(DbInstance);
};

export { repos };
