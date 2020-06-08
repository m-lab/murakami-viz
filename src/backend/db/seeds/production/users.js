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
            phone: '1-555-867-5309',
            extension: '111',
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
