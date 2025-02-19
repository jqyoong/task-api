import { type Task } from '@models/pgsql/schemas';

import { repos } from '@repos/index';
import { CustomError } from '@helpers/index';
import { PaginationConfig } from '@def/types/drizzle';

class TaskService {
  async getTasks({ paginationConfig, throwError = false }: { paginationConfig: PaginationConfig<Task>; throwError?: boolean }) {
    const tasksResponse = await repos.Task?.getTasks({ paginationConfig });
    if (!tasksResponse?.collections && throwError) throw new CustomError({ message: 'UNABLE_GET_TASKS', statusCode: 404 });

    return tasksResponse;
  }
}

export const asInstance = TaskService;
export const asDefault = new TaskService();
