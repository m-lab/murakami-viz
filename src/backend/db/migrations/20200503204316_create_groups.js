export function up(knex) {
  return Promise.all([
    knex.schema.createTable('groups', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table
        .string('groupName')
        .unique()
        .index()
        .notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('user_groups', table => {
      table.integer('gid').index();
      table
        .foreign('gid')
        .references('id')
        .inTable('groups');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('id')
        .inTable('users');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('user_groups'),
    knex.schema.dropTable('groups'),
  ]);
}
