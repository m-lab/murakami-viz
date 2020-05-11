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
        table.text('ip');
        table.text('bandwith_cap_upload');
        table.text('bandwith_cap_download');
        table.text('device_name');
        table.text('device_location');
        table.text('device_network_type');
        table.text('device_connection_type');
        table.text('device_dns');
        table.text('device_ip');
        table.text('device_gateway');
        table.text('device_mac_address');
        table.timestamps(true, true);
        table
          .integer('user_id')
          .references('id')
          .inTable('users');
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
