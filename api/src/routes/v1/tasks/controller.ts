import { type Task } from '@models/pgsql/schemas/tasks.schema';
import { type OrderByColumn } from '@def/types/drizzle';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@def/types/fastify-typebox';

import { GetTasksSchema, PostNewTaskSchema, GetTaskByIdSchema, PutUpdateTaskByIdSchema } from './schemas';

const taskService = (await import('@services/common/task')).asDefault;
import { Tracer, Utilities } from '@helpers/index';

class TaskController {
  async getTasks(req: FastifyRequestTypebox<typeof GetTasksSchema>, reply: FastifyReplyTypebox<typeof GetTasksSchema>) {
    return Tracer.traceFunction({
      name: 'controller.getTasks',
      promise: async () => {
        const { get_all, page, page_size, name, sort } = req.query;

        const orderByColumns = sort
          ? sort.split(',').map((sortItem) => {
              const parts = sortItem.split('_');
              const direction = parts[parts.length - 1];
              const column = parts.slice(0, -1).join('_') as keyof Task;

              return {
                column,
                orderBy: direction as 'asc' | 'desc',
              };
            })
          : ([
              {
                column: 'created_at',
                orderBy: 'desc',
              },
            ] as OrderByColumn<Task>[]);

        const tasks = await taskService.getTasks({
          taskName: name,
          paginationConfig: {
            withCount: true,
            limit: get_all ? undefined : page_size,
            offset: get_all ? undefined : Utilities.getPageOffSet(page, page_size),
            orderByColumns,
          },
        });

        return reply.send(tasks);
      },
    });
  }

  async getTaskById(req: FastifyRequestTypebox<typeof GetTaskByIdSchema>, reply: FastifyReplyTypebox<typeof GetTaskByIdSchema>) {
    return Tracer.traceFunction({
      name: 'controller.getTaskById',
      promise: async () => {
        const { id } = req.params;

        const task = await taskService.getTaskById({ id });

        return reply.send({ task });
      },
    });
  }

  async updateTaskById(
    req: FastifyRequestTypebox<typeof PutUpdateTaskByIdSchema>,
    reply: FastifyReplyTypebox<typeof PutUpdateTaskByIdSchema>
  ) {
    return Tracer.traceFunction({
      name: 'controller.updateTaskById',
      promise: async () => {
        const { id } = req.params;
        const { name, description, due_date } = req.body;

        const task =
          (
            await taskService.updateTaskById({
              id,
              value: { name, description, due_date: due_date ? new Date(due_date) : null },
            })
          )?.[0] || null;

        return reply.send({ task });
      },
    });
  }

  async createNewTask(req: FastifyRequestTypebox<typeof PostNewTaskSchema>, reply: FastifyReplyTypebox<typeof PostNewTaskSchema>) {
    return Tracer.traceFunction({
      name: 'controller.createNewTask',
      promise: async () => {
        const { name, description, due_date } = req.body;

        const task = await taskService.createNewTask({
          name,
          description,
          dueDate: due_date ? new Date(due_date) : null,
        });

        return reply.send({ task });
      },
    });
  }
}

export default new TaskController();
