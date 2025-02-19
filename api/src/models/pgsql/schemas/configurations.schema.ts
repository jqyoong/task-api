import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const Configurations = pgTable('Configurations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: text('value'),
  hidden: boolean('hidden'),
  is_editable: boolean('is_editable'),
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

export type Configuration = typeof Configurations.$inferSelect;
