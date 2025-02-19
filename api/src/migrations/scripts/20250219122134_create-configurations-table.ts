import { Knex } from 'knex';

const TABLE = 'Configurations';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE, function (t) {
    t.comment('Store the Server Configurations.');

    t.increments('id');
    t.text('name').notNullable();
    t.text('value');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
