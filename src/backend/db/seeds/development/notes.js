export function seed(knex) {
  return knex('notes')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('notes').insert([
        {
          id: 1,
          title: 'Printer connection issue',
          author: 1,
          body:
            'Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae. Quam temere in vitiis, legem sancimus haerentia. Integer legentibus erat a ante historiarum dapibus.',
        },
        {
          id: 2,
          title: 'Tityre, tu patulae recubans sub tegmine fagi dolor',
          author: 1,
          body:
            'Petierunt uti sibi concilium totius Galliae in diem certam indicere. Unam incolunt Belgae, aliam Aquitani, tertiam.',
        },
        {
          id: 3,
          title: 'Ullamco laboris nisi ut aliquid ex ea commodi consequat',
          author: 1,
          body:
            'Fabio vel iudice vincam, sunt in culpa qui officia. Quam diu etiam furor iste tuus nos eludet? Quae vero auctorem tractata ab fiducia dicuntur.',
        },
      ]);
    });
}
