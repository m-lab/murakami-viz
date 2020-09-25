export function seed(knex) {
  return knex('faqs')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('faqs').insert([
        {
          id: 1,
          question:
            'What has roots as nobody sees, is taller than trees, up, up it goes, and yet never grows?',
          answer: 'A mountain',
        },
        {
          id: 2,
          question:
            'A box without hinges, key or lid, yet golden treasure inside is hid. What is it?',
          answer: 'An egg!',
        },
        {
          id: 3,
          question:
            'Thirty white horses on a red hill. First they champ, then they stamp, then they stand still. What are they?',
          answer: 'Teeth!',
        },
      ]);
    });
}
