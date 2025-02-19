import { FastifyReplyTypebox, FastifyRequestTypebox } from '@def/types/fastify-typebox';

import { GetTasksSchema } from './schemas';

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
}

export default new TaskController();
