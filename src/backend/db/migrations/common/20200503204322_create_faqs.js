import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('faqs', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.text('question');
      table.text('answer');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(onUpdateTrigger(knex.context.client.config.client, 'faqs')),
    );
}

export function down(knex) {
  return knex.schema.dropTable('faqs');
}
