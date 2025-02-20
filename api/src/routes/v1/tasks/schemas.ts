import { Type } from '@sinclair/typebox';

import { Task, Pagination, PaginationQueryString } from '@routes/schemas/base/index';

const taskResponse = Type.Object({ ...Task });

const GetTasksSchema = {
  summary: 'Get tasks.',
  querystring: Type.Object({
    ...PaginationQueryString,
    name: Type.Optional(Type.String()),
    get_all: Type.Optional(Type.Boolean()),
    sort: Type.Optional(Type.RegExp(/^$|^\w+_(desc|asc)(?:,\w+_(desc|asc))*$/)),
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

const GetTaskByIdSchema = {
  summary: 'Get task by task id.',
  params: Type.Object({
    id: Type.Number(),
  }),
  response: {
    200: Type.Object({
      task: taskResponse,
    }),
    400: {
      errors: ['UNABLE_GET_TASK'],
    },
  },
};

const PostNewTaskSchema = {
  summary: 'Create new task.',
  body: Type.Object(
    {
      name: Type.String(),
      description: Type.Optional(Type.String()),
      due_date: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
  response: {
    200: Type.Object({
      task: taskResponse,
    }),
    400: {
      errors: ['MISSING_TASK_NAME', 'UNABLE_CREATE_TASK'],
    },
  },
};

const PutUpdateTaskByIdSchema = {
  summary: 'Update task by task id.',
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object(
    {
      name: Type.Optional(Type.String()),
      description: Type.Optional(Type.String()),
      due_date: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
  response: {
    200: Type.Object({
      task: taskResponse,
    }),
    400: {
      errors: ['UNABLE_UPDATE_TASK'],
    },
  },
};

export { GetTasksSchema, PostNewTaskSchema, GetTaskByIdSchema, PutUpdateTaskByIdSchema };
