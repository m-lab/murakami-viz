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
      table.decimal('SchemaVersion', null);
      table.string('TestUUID');
      table.string('TestProtocol');
      table.string('TestError');
      table.string('ServerName');
      table.string('ServerIP');
      table.string('ServerURL');
      table.decimal('ServerLat', null);
      table.decimal('ServerLon', null);
      table.string('ServerCountry');
      table.string('ServerCountryCode');
      table.string('ServerSponsor');
      table.integer('ServerID');
      table.string('ServerHost');
      table.decimal('ServerDistance', null);
      table.decimal('ServerLatency', null);
      table.string('ServerLatencyUnit');
      table.string('ClientIP');
      table.decimal('ClientLat', null);
      table.decimal('ClientLon', null);
      table.string('DownloadUUID');
      table.timestamp('DownloadTestStartTime');
      table.timestamp('DownloadTestEndTime');
      table.decimal('DownloadValue', null);
      table.string('DownloadUnit');
      table.string('DownloadError');
      table.decimal('DownloadRetransValue', null);
      table.string('DownloadRetransUnit');
      table.string('Isp');
      table.decimal('IspDownloadAvg', null);
      table.decimal('IspUploadAvg', null);
      table.decimal('IspRating', null);
      table.integer('Rating');
      table.decimal('UploadValue', null);
      table.string('UploadUnit');
      table.string('UploadError');
      table.decimal('MinRTTValue', null);
      table.string('MinRTTUnit');
      table.string('MinRTTError');
      table.decimal('MedianBitrate', null);
      table.string('MedianBitrateUnits');
      table.decimal('MinPlayoutDelay', null);
      table.string('MinPlayoutDelayUnits');
      table.decimal('Ping', null);
      table.string('PingUnit');
      table.integer('BytesSent');
      table.integer('BytesReceived');
      table.string('Timestamp');
      table.string('Share');
      table.string('ProbeASN');
      table.string('ProbeCC');
      table.decimal('ConnectLatency', null);
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
