export function up(knex) {
  return Promise.all([
    knex.schema.createTable('notes', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table
        .string('title')
        .unique()
        .index()
        .notNullable();
      table.integer('author').index();
      table
        .foreign('author')
        .references('id')
        .inTable('users');
      table.string('body');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('library_notes', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.integer('nid').index();
      table
        .foreign('nid')
        .references('id')
        .inTable('notes');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('notes'),
    knex.schema.dropTable('library_notes'),
  ]);
}
