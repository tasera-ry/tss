const tracks = [
  {
    name: 'Rata 1 - 25m Pistoolirata'
    , description: '60 ampumapaikkaa(3 x 20 paikkaa väliseinin)'
  }
  , {
    name: 'Rata 2 - 150m RK -rata'
    , description: '40 ampumapaikkaa'
  }
  , {
    name: 'Rata 3 - 300m Kivääritata'
    , description: '40 ampumapaikkaa'
  }
  , {
    name: 'Rata 4 - 75m / 100m Hirvirata'
    , description: '20 ampumapaikkaa (75m) / 4 paikkainen ampumakoppi (100m)'
  }
  , {
    name: 'Rata 5 - 100m Kohdistusrata'
    , description: '4 ampumapaikkaa'
  }
  , {
    name: 'Rata 6 - 50m pienoiskiväärirata'
    , description: '60 ampumapaikkaa, nauhataululaitteet'
  }
  , {
    name: 'Rata 7 - Toiminta-ampumarata'
    , description: '25 ampumapaikkaa'
  }
]

exports.seed = function(knex) {
  return knex('range')
    .where({
      name: 'SATLSTO:n ampumarata'
    })
    .select('id')
    .then(ranges => {
      const range = ranges.pop()
      tracks.forEach(track => track.range_id = range.id)
      return knex('track')
        .insert(tracks)
    })
}
