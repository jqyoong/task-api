import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

import fp from 'fastify-plugin';

export interface jwtAuthenticationFunc {
  (req: FastifyRequest, reply: FastifyReply): Promise<unknown | void>;
}

const jwtAuthentication: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('jwtAuthentication', async function (req, reply) {
    try {
      // you can set your JWT authentication logic here
      return true;
    } catch (err) {
      reply.send(err);
    }
  });
};

export default fp(jwtAuthentication);
