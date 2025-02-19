import { Type } from '@sinclair/typebox';

const Task = {
  id: Type.String(),
  name: Type.String(),
  description: Type.String(),
  due_date: Type.String(),
  status: Type.String({ enum: ['not_urgent', 'due_soon', 'overdue'] }),
  created_at: Type.String(),
  updated_at: Type.String(),
};

export default Task;
