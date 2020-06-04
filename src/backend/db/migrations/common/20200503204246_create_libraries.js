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
        table.text('network_name');
        table.text('isp');
        table.text('contracted_speed_upload');
        table.text('contracted_speed_download');
        table.text('bandwidth_cap_upload');
        table.text('bandwidth_cap_download');
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
    knex.schema.createTable('library_ips', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.text('ip');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('libraries'),
    knex.schema.dropTable('library_users'),
    knex.schema.dropTable('library_ips'),
  ]);
}
