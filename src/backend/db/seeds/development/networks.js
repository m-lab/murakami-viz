export function seed(knex) {
  return knex('networks')
    .del()
    .then(function() {
      return Promise.all([
        knex('networks').insert([
          {
            id: 1,
            name: 'fire',
            isp: 'mischievous',
            ips: JSON.stringify(['80.158.189.36', '72.214.237.96']),
            contracted_speed_upload: '900 mbps',
            contracted_speed_download: '867 mbps',
            bandwidth_cap_upload: '100 mb',
            bandwidth_cap_download: 'not sure',
          },
          {
            id: 2,
            name: 'doula peep',
            isp: 'bad boy company',
            ips: JSON.stringify(['81.133.155.212', '1.146.98.30']),
            contracted_speed_upload: '900 mbps',
            contracted_speed_download: '867 mbps',
            bandwidth_cap_upload: '100 mb',
            bandwidth_cap_download: '60 mb',
          },
          {
            id: 3,
            name: 'big thief',
            isp: 'not shy',
            ips: JSON.stringify(['205.239.73.28', '114.179.166.241']),
            contracted_speed_upload: '900 mbps',
            contracted_speed_download: '867 mbps',
            bandwidth_cap_upload: '100 mb',
            bandwidth_cap_download: '60 mb',
          },
          {
            id: 4,
            name: 'new rules',
            isp: 'future',
            ips: JSON.stringify(['163.10.211.69', '125.227.139.213']),
            contracted_speed_upload: '900 mbps',
            contracted_speed_download: '867 mbps',
            bandwidth_cap_upload: '100 mb',
            bandwidth_cap_download: '60 mb',
          },
        ]),
        knex('library_networks').insert([
          {
            lid: 1,
            nid: 1,
          },
          {
            lid: 1,
            nid: 2,
          },
          {
            lid: 2,
            nid: 3,
          },
          {
            lid: 2,
            nid: 4,
          },
        ]),
      ]);
    });
}
