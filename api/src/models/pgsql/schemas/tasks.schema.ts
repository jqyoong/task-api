import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, bigserial } from 'drizzle-orm/pg-core';

export const Tasks = pgTable('Tasks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: text('name'),
  description: text('description'),
  due_date: timestamp('due_date', { withTimezone: true, mode: 'date' }),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'date' })
    .default(sql`null`)
    .$type<Date | null>(),
});

export type Task = typeof Tasks.$inferSelect & {
  status: 'not_urgent' | 'due_soon' | 'overdue';
};
