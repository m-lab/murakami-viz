export function up(knex) {
  return knex.schema
    .createTable('settings', table => {
      table
        .string('key')
        .primary()
        .unique();
      table.text('value');
    })
    .then(() => {
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

export function down(knex) {
  return knex.schema.dropTable('settings');
}
