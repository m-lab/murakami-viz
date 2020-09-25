export function up(knex) {
  return knex.schema.createTable('settings', table => {
    table
      .string('key')
      .primary()
      .unique();
    table.string('value');
  });
}

export function down(knex) {
  return knex.schema.dropTable('settings');
}
