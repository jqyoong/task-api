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

  async createNewTask({
    name,
    description,
    dueDate,
    throwError = false,
  }: {
    name: Task['name'];
    description?: Task['description'];
    dueDate?: Task['due_date'];
    throwError?: boolean;
  }) {
    if (!name) throw new CustomError({ message: 'MISSING_TASK_NAME', statusCode: 400 });

    const newTask = await repos.Task?.create({
      name,
      description,
      due_date: dueDate,
    });

    if (!newTask && throwError) throw new CustomError({ message: 'UNABLE_CREATE_TASK', statusCode: 404 });

    return newTask;
  }
}

export const asInstance = TaskService;
export const asDefault = new TaskService();
