export function up(knex) {
  return knex.schema.createTable('users', table => {
    table
      .increments('id')
      .primary()
      .unsigned();
    table
      .string('userName')
      .unique()
      .index()
      .notNullable();
    table.string('password').notNullable();
    table.string('firstName').index();
    table.string('lastName').index();
    table
      .string('email')
      .unique()
      .index()
      .notNullable();
    table.boolean('isActive').defaultTo(true);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
