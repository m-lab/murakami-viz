import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('notes', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table
          .string('title')
          .unique()
          .index()
          .notNullable();
        table.integer('author').index();
        table
          .foreign('author')
          .references('id')
          .inTable('users');
        table.string('body');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(onUpdateTrigger(knex.context.client.config.client, 'notes')),
      ),
    knex.schema.createTable('library_notes', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.integer('nid').index();
      table
        .foreign('nid')
        .references('id')
        .inTable('notes');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('notes'),
    knex.schema.dropTable('library_notes'),
  ]);
}
