import type { DBInstance } from '@models/pgsql';

import { DbInstance } from '@models/pgsql/index';
import ConfigurationRepo from '@repos/configurations.repo';
import TaskRepo from '@repos/tasks.repo';

type Repositories = {
  db?: DBInstance;
  Configuration?: ConfigurationRepo;
  Task?: TaskRepo;
};

const repos: Repositories = {};
export const init = async () => {
  repos.db = DbInstance!;
  repos.Configuration = new ConfigurationRepo(DbInstance);
  repos.Task = new TaskRepo(DbInstance);
};

export { repos };
