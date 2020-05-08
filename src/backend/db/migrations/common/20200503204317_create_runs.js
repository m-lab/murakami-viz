import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('runs', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.string('SchemaVersion');
        table.string('TestName');
        table.string('TestUUID');
        table.string('TestProtocol');
        table.string('TestError');
        table.string('ServerName');
        table.string('ServerIP');
        table.string('ClientIP');
        table.string('MurakamiLocation');
        table.string('MurakamiNetworkType');
        table.string('MurakamiConnectionType');
        table.string('DownloadUUID');
        table.timestamp('DownloadTestStartTime');
        table.timestamp('DownloadTestEndTime');
        table.decimal('DownloadValue');
        table.string('DownloadUnit');
        table.string('DownloadError');
        table.decimal('DownloadRetransValue');
        table.string('DownloadRetransUnit');
        table.decimal('UploadValue');
        table.string('UploadUnit');
        table.string('UploadError');
        table.string('MinRTTValue');
        table.string('MinRTTUnit');
        table.string('MinRTTError');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(onUpdateTrigger(knex.context.client.config.client, 'runs')),
      ),
    knex.schema.createTable('library_runs', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.integer('rid').index();
      table
        .foreign('rid')
        .references('id')
        .inTable('runs');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('library_runs'),
    knex.schema.dropTable('runs'),
  ]);
}