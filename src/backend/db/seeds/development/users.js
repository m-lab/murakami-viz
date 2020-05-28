import bcrypt from 'bcryptjs';

export function seed(knex) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync('averylongandgoodpassword', salt);
  return knex('users')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: 1,
          username: 'admin',
          password: hash,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@mlbn.org',
          location: 'Washington, DC',
          role: 'Admin',
        },
        {
          id: 2,
          username: 'editor',
          password: hash,
          firstName: 'Rae',
          lastName: 'Gaines',
          email: 'rae@throneless.tech',
          location: 'Washington, DC',
          role: 'Editor',
        },
      ]);
    });
}
