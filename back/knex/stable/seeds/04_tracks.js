const tracks = [
  {
    name: 'Rata 1',
    description: '25m Pistoolirata - 60 ampumapaikkaa(3 x 20 paikkaa väliseinin)',
    short_description: '25m pistooli'
  },
  {
    name: 'Rata 2',
    description: '150m RK -rata - 40 ampumapaikkaa',
    short_description: '150m RK'
  },
  {
    name: 'Rata 3',
    description: '300m Kiväärirata - 40 ampumapaikkaa',
    short_description: '300m Kivääri'
  },
  {
    name: 'Rata 4',
    description: '75m / 100m Hirvirata - 20 ampumapaikkaa (75m) / 4 paikkainen ampumakoppi (100m)',
    short_description: '75m / 100m Hirvi'
  },
  {
    name: 'Rata 5',
    description: '100m Kohdistusrata - 4 ampumapaikkaa',
    short_description: '100m Kohdistus'
  },
  {
    name: 'Rata 6',
    description: '50m pienoiskiväärirata - 60 ampumapaikkaa, nauhataululaitteet',
    short_description: '50m pienoiskivääri'
  },
  {
    name: 'Rata 7',
    description: 'Toiminta-ampumarata - 25 ampumapaikkaa',
    short_description: 'Toiminta-ampuma'
  }
];

exports.seed = function(knex) {
  return knex('range')
    .where({
      name: 'SATLSTO:n ampumarata'
    })
    .select('id')
    .then(ranges => {
      const range = ranges.pop();
      tracks.forEach(track => track.range_id = range.id);
      return knex('track')
        .insert(tracks);
    });
};
