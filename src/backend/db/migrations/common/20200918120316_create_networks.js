import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('networks', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.string('name').unique();
        table.text('isp');
        table.text('ips');
        table.text('contracted_speed_upload');
        table.text('contracted_speed_download');
        table.text('bandwidth_cap_upload');
        table.text('bandwidth_cap_download');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(
          onUpdateTrigger(knex.context.client.config.client, 'networks'),
        ),
      ),
    knex.schema.createTable('library_networks', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.integer('nid').index();
      table
        .foreign('nid')
        .references('id')
        .inTable('networks');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('library_networks'),
    knex.schema.dropTable('networks'),
  ]);
}
