import { PaginationConfig, PaginationResponse } from '@def/types/drizzle';

import { and, count, SQL, type InferSelectModel } from 'drizzle-orm';
import type { DBInstance } from '@models/pgsql';

import dayjs from 'dayjs';

import { Task, Tasks } from '@models/pgsql/schemas';
import BaseRepository from '@repos/base.repo';
import { Utilities } from '@helpers/index';

const tableName = 'Tasks';
type schema = typeof Tasks;

class TasksRepo extends BaseRepository<schema, typeof tableName> {
  constructor(db: DBInstance | null | undefined) {
    if (!db) return;
    super({ db, table: Tasks, tableName, softDelete: true });
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

  async afterFind(
    row: InferSelectModel<schema> | InferSelectModel<schema>[]
  ): Promise<(InferSelectModel<schema> & { status: string }) | (InferSelectModel<schema> & { status: string })[]> {
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

  async afterCreate(row: InferSelectModel<schema>): Promise<InferSelectModel<schema> & { status: string }> {
    return {
      ...row,
      status: this.calculateStatus(row.due_date),
    };
  }

  getTasks({
    columns,
    paginationConfig,
    throwError = true,
  }: {
    columns?: { [key in keyof Task]?: boolean };
    paginationConfig: PaginationConfig<Task>;
    throwError?: boolean;
  }) {
    return this.modelHandler({
      throwError,
      promise: async () => {
        const whereQuery = () => {
          const filters: SQL[] = [];
          return and(...filters);
        };
        let totalCount = 0;

        const tasks = await this.findMany({
          where: whereQuery(),
          columns,
          orderBy(fields, operators) {
            if (!paginationConfig?.orderByColumns || paginationConfig?.orderByColumns.length < 1) {
              return operators.asc(fields.created_at);
            }
            return paginationConfig.orderByColumns.map((o) => {
              return operators.sql.raw(`${o.column} ${o.orderBy}`);
            });
          },
          limit: paginationConfig.limit,
          offset: paginationConfig.offset,
        });

        if (paginationConfig.withCount) {
          totalCount =
            (
              await this.findMany({
                where: whereQuery(),
                columns: {},
                extras: {
                  totalCount: count(Tasks.id).as('totalCount'),
                },
              })
            )?.[0]?.totalCount ?? 0;
        }

        return {
          collections: tasks,
          pagination: Utilities.getPaginationResponse(Object.assign({}, paginationConfig, { totalCount })),
        };
      },
    }) as unknown as PaginationResponse<Task[]>;
  }

  getTaskById({ id, columns, throwError = true }: { id: Task['id']; columns?: { [key in keyof Task]?: boolean }; throwError?: boolean }) {
    return this.modelHandler({
      throwError,
      promise: async () => {
        const chat = await this.findFirst({
          where(fields, operators) {
            const filters: SQL[] = [];
            filters.push(operators.eq(fields.id, id));
            return operators.and(...filters);
          },
          columns,
        });

        return chat;
      },
    }) as unknown as Task;
  }
}

export default TasksRepo;
