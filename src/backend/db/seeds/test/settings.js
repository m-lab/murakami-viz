export function seed(knex) {
  return knex('settings')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('settings').insert([
        {
          key: 'about',
          value: 'This is the about blurb.',
        },
        {
          key: 'contact',
          value: 'This is the contact blurb.',
        },
        {
          key: 'forum',
          value: 'https://example.com',
        },
      ]);
    });
}
