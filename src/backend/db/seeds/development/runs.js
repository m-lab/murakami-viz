export function seed(knex) {
  return knex('runs')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('runs').insert([
        { id: 1,
          SchemaVersion:1,
          TestName: "ndt7",
          TestUUID: "",
          TestProtocol: "ndt7",
          TestError: "",
          ServerName: "Correggio",
          ServerIP: "0.0.0.0.0",
          ClientIP: "192.168.0.0.1",
          MurakamiLocation: "Corciano",
          MurakamiNetworkType: "home",
          MurakamiConnectionType: "wifi",
          DownloadUUID: "ndt-cz99j_1580820576_000000000003708B",
          DownloadTestStartTime: "2020-02-18 20:32:52.639720903 +0000 UTC m=+5825.539350534",
          DownloadTestEndTime: "2020-02-18 20:33:02.640686711 +0000 UTC m=+5835.540316330",
          DownloadValue: 405.32368416128276,
          DownloadUnit: "Mbit/s",
          DownloadError: "",
          DownloadRetransValue: 2.3442441873334583,
          DownloadRetransUnit: "%",
          UploadValue: 26.85925099645699,
          UploadUnit: "Mbit/s",
          MinRTTValue: 29.108,
          MinRTTUnit: "ms",
        },
      ]);
    });
};
