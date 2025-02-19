import { type InferSelectModel } from 'drizzle-orm';
import type { DBInstance } from '@models/pgsql';

import dayjs from 'dayjs';

import { Tasks } from '@models/pgsql/schemas';
import BaseRepository from '@repos/base.repo';

const tableName = 'Tasks';
type schema = typeof Tasks;

class TasksRepo extends BaseRepository<schema, typeof tableName> {
  constructor(db: DBInstance | null | undefined) {
    if (!db) return;
    super({ db, table: Tasks, tableName, softDelete: true });
  }

  async afterFind(
    row: InferSelectModel<schema> | InferSelectModel<schema>[]
  ): Promise<InferSelectModel<schema> | InferSelectModel<schema>[]> {
    if (Array.isArray(row)) {
      return row.map((r) => ({
        ...r,
        status: this.calculateStatus(r.due_date),
      }));
    }
    return {
      ...row,
      status: this.calculateStatus(row.due_date),
    };
  }

  private calculateStatus(dueDate: Date | null): 'not_urgent' | 'due_soon' | 'overdue' {
    if (!dueDate) return 'not_urgent';

    const now = dayjs();
    const dueDateJs = dayjs(dueDate);
    const sevenDaysFromNow = now.add(7, 'day');

    if (dueDateJs.isBefore(now)) {
      return 'overdue';
    } else if (dueDateJs.isBefore(sevenDaysFromNow) || dueDateJs.isSame(sevenDaysFromNow)) {
      return 'due_soon';
    } else {
      return 'not_urgent';
    }
  }
}

export default TasksRepo;
