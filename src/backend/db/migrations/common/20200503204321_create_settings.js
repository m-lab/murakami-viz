import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('settings', table => {
      table
        .string('key')
        .primary()
        .unique();
      table.string('value');
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
      ]);
    });
}

export function down(knex) {
  return knex.schema.dropTable('settings');
}
