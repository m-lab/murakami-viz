export function seed(knex) {
  return Promise.all([
    knex('groups')
      .del()
      .then(function() {
        // Inserts seed entries
        return knex('groups').insert([
          {
            id: 1,
            name: 'admins',
          },
          {
            id: 2,
            name: 'editors',
          },
          {
            id: 3,
            name: 'viewers',
          },
        ]);
      }),
  ]);
}
