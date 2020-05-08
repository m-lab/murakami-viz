import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('systems', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table
          .string('name')
          .unique()
          .index()
          .notNullable();
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(onUpdateTrigger(knex.context.client.config.client, 'systems')),
      ),
    knex.schema.createTable('library_systems', table => {
      table.integer('sid').index();
      table
        .foreign('sid')
        .references('id')
        .inTable('systems');
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('systems'),
    knex.schema.dropTable('library_systems'),
  ]);
}
