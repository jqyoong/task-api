import { IJsonSchema } from 'openapi-types';
import { FastifySchema } from 'fastify';

export type FOSchema = FastifySchema & IJsonSchema;
export type CustomErrorSchema = FOSchema & {
  response: {
    [statusCode: string]: Partial<
      Record<string, unknown> & {
        errors: string[];
      }
    >;
  };
};
