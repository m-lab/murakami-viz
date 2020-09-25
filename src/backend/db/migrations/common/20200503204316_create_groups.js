import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('groups', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table
          .string('name')
          .unique()
          .index()
          .notNullable();
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(onUpdateTrigger(knex.context.client.config.client, 'groups')),
      ),
    knex.schema.createTable('user_groups', table => {
      table.integer('gid').index();
      table
        .foreign('gid')
        .references('groups.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('users.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('user_groups'),
    knex.schema.dropTable('groups'),
  ]);
}
