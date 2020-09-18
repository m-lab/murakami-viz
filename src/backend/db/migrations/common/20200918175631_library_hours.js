export function up(knex) {
  return knex.schema
    .table('libraries', table => table.dropColumn('opening_hours'))
    .then(() => {
      return knex.schema.table('libraries', table => {
        table.text('sunday_open');
        table.text('sunday_close');
        table.text('monday_open');
        table.text('monday_close');
        table.text('tuesday_open');
        table.text('tuesday_close');
        table.text('wednesday_open');
        table.text('wednesday_close');
        table.text('thursday_open');
        table.text('thursday_close');
        table.text('friday_open');
        table.text('friday_close');
        table.text('saturday_open');
        table.text('saturday_close');
        return;
      });
    });
}

export function down(knex) {
  return knex.schema
    .table('libraries', table => {
      table.dropColumn('sunday_open');
      table.dropColumn('sunday_close');
      table.dropColumn('monday_open');
      table.dropColumn('monday_close');
      table.dropColumn('tuesday_open');
      table.dropColumn('tuesday_close');
      table.dropColumn('wednesday_open');
      table.dropColumn('wednesday_close');
      table.dropColumn('thursday_open');
      table.dropColumn('thursday_close');
      table.dropColumn('friday_open');
      table.dropColumn('friday_close');
      table.dropColumn('saturday_open');
      table.dropColumn('saturday_close');
    })
    .then(() =>
      knex.schema.table('libraries', table => table.text('opening_hours')),
    );
}
