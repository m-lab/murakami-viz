import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('glossaries', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.text('term');
      table.text('definition');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(
        onUpdateTrigger(knex.context.client.config.client, 'glossaries'),
      ),
    );
}

export function down(knex) {
  return knex.schema.dropTable('glossaries');
}
