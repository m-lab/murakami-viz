export function seed(knex) {
  return knex('runs')
    .del()
    .then(function() {
      // Inserts seed entries
      return Promise.all([
        knex('runs').insert([
          {
            id: 1,
            SchemaVersion: 1,
            TestName: 'ndt7',
            TestUUID: '',
            TestProtocol: 'ndt7',
            TestError: '',
            ServerName: 'Correggio',
            ServerIP: '0.0.0.0.0',
            ClientIP: '192.168.0.0.1',
            MurakamiLocation: 'Corciano',
            MurakamiNetworkType: 'home',
            MurakamiConnectionType: 'wifi',
            MurakamiDeviceID: 'bb62c6e5-6ed1-452e-89ef-f8f3005f4612',
            DownloadUUID: 'ndt-cz99j_1580820576_000000000003708B',
            DownloadTestStartTime:
              '2020-06-03 20:32:52.639720903 +0000 UTC m=+5825.539350534',
            DownloadTestEndTime:
              '2020-06-03 20:33:02.640686711 +0000 UTC m=+5835.540316330',
            DownloadValue: 405.32368416128276,
            DownloadUnit: 'Mbit/s',
            DownloadError: '',
            DownloadRetransValue: 2.3442441873334583,
            DownloadRetransUnit: '%',
            UploadValue: 26.85925099645699,
            UploadUnit: 'Mbit/s',
            MinRTTValue: 29.108,
            MinRTTUnit: 'ms',
          },
          {
            id: 2,
            SchemaVersion: 1,
            TestName: 'ndt7',
            TestUUID: '',
            TestProtocol: 'ndt7',
            TestError: '',
            ServerName: 'Correggio',
            ServerIP: '0.0.0.0.0',
            ClientIP: '192.168.0.0.1',
            MurakamiDeviceID: 'ad2f4f0f-11bc-418b-8828-2f5e11045a39',
            MurakamiLocation: 'Corciano',
            MurakamiNetworkType: 'home',
            MurakamiConnectionType: 'wifi',
            DownloadUUID: 'ndt-cz99j_1580820576_000000000003708B',
            DownloadTestStartTime:
              '2020-05-29 20:32:52.639720903 +0000 UTC m=+5825.539350534',
            DownloadTestEndTime:
              '2020-05-29 20:33:02.640686711 +0000 UTC m=+5835.540316330',
            DownloadValue: 405.32368416128276,
            DownloadUnit: 'Mbit/s',
            DownloadError: '',
            DownloadRetransValue: 2.3442441873334583,
            DownloadRetransUnit: '%',
            UploadValue: 26.85925099645699,
            UploadUnit: 'Mbit/s',
            MinRTTValue: 29.108,
            MinRTTUnit: 'ms',
          },
          {
            id: 3,
            SchemaVersion: 1,
            TestName: 'ndt7',
            TestUUID: '',
            TestProtocol: 'ndt7',
            TestError: '',
            ServerName: 'Correggio',
            ServerIP: '0.0.0.0.0',
            ClientIP: '192.168.0.0.1',
            MurakamiDeviceID: '1226fb60-c7c7-456b-874e-e700d65ef72f',
            MurakamiLocation: 'Corciano',
            MurakamiNetworkType: 'home',
            MurakamiConnectionType: 'wifi',
            DownloadUUID: 'ndt-cz99j_1580820576_000000000003708B',
            DownloadTestStartTime:
              '2020-05-29 20:32:52.639720903 +0000 UTC m=+5825.539350534',
            DownloadTestEndTime:
              '2020-05-29 20:33:02.640686711 +0000 UTC m=+5835.540316330',
            DownloadValue: 405.32368416128276,
            DownloadUnit: 'Mbit/s',
            DownloadError: '',
            DownloadRetransValue: 2.3442441873334583,
            DownloadRetransUnit: '%',
            UploadValue: 26.85925099645699,
            UploadUnit: 'Mbit/s',
            MinRTTValue: 29.108,
            MinRTTUnit: 'ms',
          },
        ]),
      ]);
    });
}
