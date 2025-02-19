import { FastifyReplyTypebox, FastifyRequestTypebox } from '@def/types/fastify-typebox';

import { GetTasksSchema, PostNewTaskSchema } from './schemas';

const taskService = (await import('@services/common/task')).asDefault;
import { Tracer, Utilities } from '@helpers/index';

class TaskController {
  async getTasks(req: FastifyRequestTypebox<typeof GetTasksSchema>, reply: FastifyReplyTypebox<typeof GetTasksSchema>) {
    return Tracer.traceFunction({
      name: 'controller.getTasks',
      promise: async () => {
        const { get_all, page, page_size } = req.query;

        const tasks = await taskService.getTasks({
          paginationConfig: {
            withCount: true,
            limit: get_all ? undefined : page_size,
            offset: get_all ? undefined : Utilities.getPageOffSet(page, page_size),
            orderByColumns: [
              {
                column: 'created_at',
                orderBy: 'desc',
              },
            ],
          },
        });

        return reply.send(tasks);
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
