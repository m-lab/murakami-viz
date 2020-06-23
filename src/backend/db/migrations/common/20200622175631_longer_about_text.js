export function up(knex) {
  return knex.schema
    .table('settings', table => table.dropColumn('value'))
    .then(() => knex.schema.table('settings', table => table.text('value')));
}

export function down(knex) {
  return knex.schema
    .table('settings', table => table.dropColumn('value'))
    .then(() => knex.schema.table('settings', table => table.string('value')));
}
