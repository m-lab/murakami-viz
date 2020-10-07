export function up(knex) {
  return knex.schema
    .table('networks', table => table.dropColumn('ips'))
    .then(() => knex.schema.table('networks', table => table.json('ips')));
}

export function down(knex) {
  return knex.schema
    .table('networks', table => table.dropColumn('ips'))
    .then(() => knex.schema.table('networks', table => table.text('value')));
}
