import { FastifyPluginAsync } from 'fastify';

import { GetTasksSchema, PostNewTaskSchema, GetTaskByIdSchema } from './schemas';

import TaskController from './controller';

const routes: FastifyPluginAsync = async (server) => {
  server.get(
    '/',
    {
      preValidation: [server.jwtAuthentication],
      schema: GetTasksSchema,
    },
    TaskController.getTasks
  );

  server.get(
    '/:id',
    {
      preValidation: [server.jwtAuthentication],
      schema: GetTaskByIdSchema,
    },
    TaskController.getTaskById
  );

  server.post(
    '/new',
    {
      preValidation: [server.jwtAuthentication],
      schema: PostNewTaskSchema,
    },
    TaskController.createNewTask
  );
};

export default routes;
