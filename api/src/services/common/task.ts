import { type Task } from '@models/pgsql/schemas';
import { type SQL } from 'drizzle-orm';
import omitBy from 'lodash.omitby';

import { repos } from '@repos/index';
import { CustomError } from '@helpers/index';
import { PaginationConfig } from '@def/types/drizzle';

class TaskService {
  async getTasks({
    taskName,
    paginationConfig,
    throwError = false,
  }: {
    taskName?: Task['name'];
    paginationConfig: PaginationConfig<Task>;
    throwError?: boolean;
  }) {
    const tasksResponse = await repos.Task?.getTasks({ taskName, paginationConfig });
    if (!tasksResponse?.collections && throwError) throw new CustomError({ message: 'UNABLE_GET_TASKS', statusCode: 404 });

    return tasksResponse;
  }

  async getTaskById({ id, throwError = false }: { id: Task['id']; throwError?: boolean }) {
    const task = await repos.Task?.getTaskById({ id });
    if (!task && throwError) throw new CustomError({ message: 'UNABLE_GET_TASK', statusCode: 404 });

    return task;
  }

  async updateTaskById({ id, value, throwError = false }: { id: Task['id']; value: Partial<Task>; throwError?: boolean }) {
    const updatedTask = await repos.Task?.update(
      omitBy(value, (v) => v === undefined || v === null),
      {
        where(fields, operators) {
          const filters: SQL[] = [];
          filters.push(operators.eq(fields.id, id));
          return operators.and(...filters);
        },
      }
    );

    if (!updatedTask && throwError) throw new CustomError({ message: 'UNABLE_UPDATE_TASK', statusCode: 404 });

    return updatedTask;
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
