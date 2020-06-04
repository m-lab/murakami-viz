export function seed(knex) {
  return knex('devices')
    .del()
    .then(function() {
      // Inserts seed entries
      return Promise.all([
        knex('devices').insert([
          {
            id: 1,
            name: 'murakami0',
            network_type: 'private',
            connection_type: 'wired',
            dns_server: '192.168.1.1',
            ip: '192.168.1.41',
            gateway: '192.168.1.1',
            mac: 'ab:bc:cd:de:ef:01',
            deviceid: 'bb62c6e5-6ed1-452e-89ef-f8f3005f4612',
          },
          {
            id: 2,
            name: 'murakami1',
            network_type: 'public',
            connection_type: 'wireless',
            dns_server: '192.168.1.1',
            ip: '192.168.1.42',
            gateway: '192.168.1.1',
            mac: 'ab:bc:cd:de:ef:02',
            deviceid: 'ad2f4f0f-11bc-418b-8828-2f5e11045a39',
          },
          {
            id: 3,
            name: 'murakami2',
            network_type: 'public',
            connection_type: 'wireless',
            dns_server: '192.168.1.1',
            ip: '192.168.1.43',
            gateway: '192.168.1.1',
            mac: 'ab:bc:cd:de:ef:03',
            deviceid: '106a7ea8-3f7d-4a9a-ac26-cfe5e1b29ea0',
          },
          {
            id: 4,
            name: 'murakami3',
            network_type: 'public',
            connection_type: 'wireless',
            dns_server: '192.168.1.1',
            ip: '192.168.1.43',
            gateway: '192.168.1.1',
            mac: 'ab:bc:cd:de:ef:03',
            deviceid: '1226fb60-c7c7-456b-874e-e700d65ef72f',
          },
        ]),
        knex('library_devices').insert([
          {
            lid: 1,
            did: 1,
          },
          {
            lid: 1,
            did: 2,
          },
          {
            lid: 1,
            did: 3,
          },
          {
            lid: 2,
            did: 4,
          },
        ]),
      ]);
    });
}
