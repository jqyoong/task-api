import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

export type FastifyApplication = FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>;
