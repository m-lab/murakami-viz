export function up(knex) {
  return Promise.all([
    knex.schema.createTable('libraries', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table
        .string('name')
        .unique()
        .index()
        .notNullable();
      table.string('address');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('library_users', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
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
    knex.schema.dropTable('libraries'),
    knex.schema.dropTable('library_users'),
  ]);
}
