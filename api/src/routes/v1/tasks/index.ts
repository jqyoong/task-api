import { FastifyPluginAsync } from 'fastify';

import { GetTasksSchema } from './schemas';

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
};

export default routes;
