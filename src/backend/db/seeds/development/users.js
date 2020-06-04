import bcrypt from 'bcryptjs';

export function seed(knex) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync('averylongandgoodpassword', salt);
  return knex('users')
    .del()
    .then(function() {
      // Inserts seed entries
      return Promise.all([
        knex('users').insert([
          {
            id: 1,
            username: 'admin',
            password: hash,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@mlbn.org',
          },
          {
            id: 2,
            username: 'editor',
            password: hash,
            firstName: 'Rae',
            lastName: 'Gaines',
            email: 'rae@throneless.tech',
          },
        ]),
        knex('library_users').insert([
          {
            uid: 1,
            lid: 1,
          },
          {
            uid: 2,
            lid: 2,
          },
        ]),
      ]);
    });
}
