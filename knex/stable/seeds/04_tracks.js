const tracks = [
  {
    name: 'Rata 1'
    , description: '25m Pistoolirata - 60 ampumapaikkaa(3 x 20 paikkaa väliseinin)'
  }
  , {
    name: 'Rata 2'
    , description: '150m RK -rata - 40 ampumapaikkaa'
  }
  , {
    name: 'Rata 3'
    , description: '300m Kiväärirata - 40 ampumapaikkaa'
  }
  , {
    name: 'Rata 4'
    , description: '75m / 100m Hirvirata - 20 ampumapaikkaa (75m) / 4 paikkainen ampumakoppi (100m)'
  }
  , {
    name: 'Rata 5'
    , description: '100m Kohdistusrata - 4 ampumapaikkaa'
  }
  , {
    name: 'Rata 6'
    , description: '50m pienoiskiväärirata - 60 ampumapaikkaa, nauhataululaitteet'
  }
  , {
    name: 'Rata 7'
    , description: 'Toiminta-ampumarata - 25 ampumapaikkaa'
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
