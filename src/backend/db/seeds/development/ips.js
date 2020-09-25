export function seed(knex) {
  return knex('library_ips')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('library_ips').insert([
        {
          lid: 1,
          ip: '192.0.2.1',
        },
        {
          lid: 2,
          ip: '192.0.2.2',
        },
      ]);
    });
}
