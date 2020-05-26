export function seed(knex) {
  return knex('notes')
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
        ]),
      ]);
    });
}
