import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('runs', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.string('TestName');
      table.timestamp('TestStartTime');
      table.timestamp('TestEndTime');
      table.string('MurakamiConnectionType');
      table.string('MurakamiLocation');
      table.string('MurakamiNetworkType');
      table.string('MurakamiDeviceID');
      table.decimal('SchemaVersion');
      table.string('TestUUID');
      table.string('TestProtocol');
      table.string('TestError');
      table.string('ServerName');
      table.string('ServerIP');
      table.string('ServerURL');
      table.decimal('ServerLat');
      table.decimal('ServerLon');
      table.string('ServerCountry');
      table.string('ServerCountryCode');
      table.string('ServerSponsor');
      table.integer('ServerID');
      table.string('ServerHost');
      table.decimal('ServerDistance');
      table.decimal('ServerLatency');
      table.string('ServerLatencyUnits');
      table.string('ClientIP');
      table.decimal('ClientLat');
      table.decimal('ClientLon');
      table.string('DownloadUUID');
      table.timestamp('DownloadTestStartTime');
      table.timestamp('DownloadTestEndTime');
      table.decimal('DownloadValue');
      table.string('DownloadUnit');
      table.string('DownloadError');
      table.decimal('DownloadRetransValue');
      table.string('DownloadRetransUnit');
      table.string('Isp');
      table.decimal('IspDownloadAvg');
      table.decimal('IspUploadAvg');
      table.decimal('IspRating');
      table.integer('Rating');
      table.decimal('UploadValue');
      table.string('UploadUnit');
      table.string('UploadError');
      table.decimal('MinRTTValue');
      table.string('MinRTTUnit');
      table.string('MinRTTError');
      table.decimal('MedianBitrate');
      table.string('MedianBitrateUnits');
      table.decimal('MinPlayoutDelay');
      table.string('MinPlayoutDelayUnits');
      table.decimal('Ping');
      table.string('PingUnit');
      table.integer('BytesSent');
      table.integer('BytesReceived');
      table.string('Share');
      table.string('ProbeASN');
      table.string('ProbeCC');
      table.decimal('ConnectLatency');
      table.string('ConnectLatencyUnits');
      table.integer('LoggedIn');
      table.string('Country');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(onUpdateTrigger(knex.context.client.config.client, 'runs')),
    );
}

export function down(knex) {
  return knex.schema.dropTable('runs');
}
