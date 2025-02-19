import { Type } from '@sinclair/typebox';

import { Task, Pagination, PaginationQueryString } from '@routes/schemas/base/index';

const taskResponse = Type.Object({ ...Task });

const GetTasksSchema = {
  summary: 'Get tasks.',
  querystring: Type.Object({
    ...PaginationQueryString,
    get_all: Type.Optional(Type.Boolean()),
  }),
  response: {
    200: Type.Object({
      collections: Type.Array(taskResponse),
      pagination: Type.Object({ ...Pagination }),
    }),
    400: {
      errors: ['UNABLE_GET_TASKS'],
    },
  },
};

export { GetTasksSchema };
