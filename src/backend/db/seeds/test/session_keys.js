export function seed(knex) {
  return knex('session_keys')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('session_keys').insert([
        {
          id: 1,
          key: 'UfK6o6qE6H104Oeo',
        },
        {
          id: 2,
          key: 'BLDjRJTAx6RsyIsW',
        },
      ]);
    });
}
