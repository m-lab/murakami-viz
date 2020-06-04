import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('users', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table
        .string('username')
        .unique()
        .index()
        .notNullable();
      table.string('password').notNullable();
      table.string('firstName').index();
      table.string('lastName').index();
      table
        .string('email')
        .unique()
        .index()
        .notNullable();
      table.boolean('isActive').defaultTo(true);
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(onUpdateTrigger(knex.context.client.config.client, 'users')),
    );
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
