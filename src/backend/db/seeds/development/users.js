export function seed(knex) {
  return knex('users')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: 1,
          userName: 'rae',
          password: 'password123',
          firstName: 'Rae',
          lastName: 'Gaines',
          email: 'rae@throneless.tech',
        },
      ]);
    });
}
