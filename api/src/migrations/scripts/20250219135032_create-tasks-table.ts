import { Knex } from 'knex';

const TABLE = 'Tasks';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE, function (t) {
    t.comment('Store the Tasks.');

    t.bigIncrements('id');
    t.text('name').notNullable();
    t.text('description').defaultTo('');
    t.timestamp('due_date').nullable().defaultTo(null);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('deleted_at').nullable().defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
