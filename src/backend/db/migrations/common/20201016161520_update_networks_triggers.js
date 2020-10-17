export function up(knex) {
  return knex.schema.dropTable('library_networks').then(() => {
    return knex.schema.createTable('library_networks', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('nid').index();
      table
        .foreign('nid')
        .references('id')
        .inTable('networks')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    });
  });
}

export function down(knex) {
  return knex.schema.dropTable('library_networks').then(() => {
    return knex.schema.createTable('library_networks', table => {
      table.integer('lid').index();
      table
        .foreign('lid')
        .references('id')
        .inTable('libraries');
      table.integer('nid').index();
      table
        .foreign('nid')
        .references('id')
        .inTable('networks');
    });
  });
}
