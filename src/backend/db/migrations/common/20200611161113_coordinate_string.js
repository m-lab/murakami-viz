export function up(knex) {
  return knex.schema
    .table('libraries', table => table.dropColumn('coordinates'))
    .then(() =>
      knex.schema.table('libraries', table => table.string('coordinates')),
    );
}

export function down(knex) {
  return knex.schema
    .table('libraries', table => table.dropColumn('coordinates'))
    .then(() =>
      knex.schema.table('libraries', table =>
        table.specificType('coordinates', 'POINT'),
      ),
    );
}
