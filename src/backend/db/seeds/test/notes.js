export function seed(knex) {
  return knex('notes')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('notes').insert([
        {
          id: 1,
          subject: 'Printer connection issue',
          author: 'admin',
          date: '2020-02-18T20:32:52',
          description:
            'Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae. Quam temere in vitiis, legem sancimus haerentia. Integer legentibus erat a ante historiarum dapibus.',
        },
        {
          id: 2,
          subject: 'Tityre, tu patulae recubans sub tegmine fagi dolor',
          author: 'admin',
          date: '2020-02-19T20:32:52',
          description:
            'Petierunt uti sibi concilium totius Galliae in diem certam indicere. Unam incolunt Belgae, aliam Aquitani, tertiam.',
        },
        {
          id: 3,
          subject: 'Ullamco laboris nisi ut aliquid ex ea commodi consequat',
          author: 'admin',
          date: '2020-02-20T20:32:52',
          description:
            'Fabio vel iudice vincam, sunt in culpa qui officia. Quam diu etiam furor iste tuus nos eludet? Quae vero auctorem tractata ab fiducia dicuntur.',
        },
      ]);
    });
}
