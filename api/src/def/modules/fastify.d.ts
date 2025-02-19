import 'fastify';
import type { jwtAuthenticationFunc } from '@middlewares/01_jwtAuthentication';

declare module 'fastify' {
  interface FastifyRequest {
    detectedLng: string;
  }

  interface FastifyInstance {
    jwtAuthentication: jwtAuthenticationFunc;
  }
}
