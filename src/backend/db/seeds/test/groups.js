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
        ]);
      }),
    knex('user_groups')
      .del()
      .then(function() {
        // Inserts seed entries
        return knex('user_groups').insert([
          {
            gid: 1,
            uid: 1,
          },
        ]);
      }),
  ]);
}
