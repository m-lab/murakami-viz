export function seed(knex) {
  return knex('glossaries')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('glossaries').insert([
        {
          id: 1,
          term: 'mountain',
          definition:
            'Has roots as nobody sees, is taller than trees, up, up it goes, and yet never grows.',
        },
        {
          id: 2,
          term: 'egg',
          definition:
            'A box without hinges, key or lid, yet golden treasure inside is hid.',
        },
        {
          id: 3,
          term: 'teeth',
          definition:
            'Thirty white horses on a red hill. First they champ, then they stamp, then they stand still.',
        },
      ]);
    });
}
