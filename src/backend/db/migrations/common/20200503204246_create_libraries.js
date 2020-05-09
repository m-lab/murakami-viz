import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('libraries', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table
          .string('name')
          .unique()
          .index()
          .notNullable();
        table.text('physical_address');
        table.text('shipping_address');
        table.specificType('timezone', 'TIMEZONETZ');
        table.specificType('coordinates', 'POINT');
        table.text('primary_contact_name');
        table.text('primary_contact_email');
        table.text('it_contact_name');
        table.text('it_contact_email');
        table.text('opening_hours');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(
          onUpdateTrigger(knex.context.client.config.client, 'libraries'),
        ),
      ),
    knex.schema.createTable('library_users', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('id')
        .inTable('users');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('libraries'),
    knex.schema.dropTable('library_users'),
  ]);
}
