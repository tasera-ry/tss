const reservations = [
  {
    date: '2020-03-01'
    , available: false
  },
  {
    date: '2020-03-02'
    , available: true
  },
  {
    date: '2020-03-03'
    , available: true
  },
  {
    date: '2020-03-04'
    , available: true
  },
  {
    date: '2020-03-05'
    , available: true
  },
  {
    date: '2020-03-06'
    , available: true
  },
  {
    date: '2020-03-07'
    , available: true
  },
  {
    date: '2020-03-08'
    , available: false
  },
  {
    date: '2020-03-09'
    , available: true
  },
  {
    date: '2020-03-10'
    , available: true
  },
  {
    date: '2020-03-11'
    , available: true
  },
  {
    date: '2020-03-12'
    , available: true
  },
  {
    date: '2020-03-13'
    , available: false
  },
  {
    date: '2020-03-14'
    , available: false
  },
  {
    date: '2020-03-15'
    , available: false
  },
  {
    date: '2020-03-16'
    , available: true
  },
  {
    date: '2020-03-17'
    , available: true
  },
  {
    date: '2020-03-18'
    , available: true
  },
  {
    date: '2020-03-19'
    , available: true
  },
  {
    date: '2020-03-20'
    , available: true
  },
  {
    date: '2020-03-21'
    , available: true
  },
  {
    date: '2020-03-22'
    , available: false
  },
  {
    date: '2020-03-23'
    , available: true
  },
  {
    date: '2020-03-24'
    , available: true
  },
  {
    date: '2020-03-25'
    , available: true
  },
  {
    date: '2020-03-26'
    , available: true
  },
  {
    date: '2020-03-27'
    , available: false
  },
  {
    date: '2020-03-28'
    , available: true
  },
  {
    date: '2020-03-29'
    , available: false
  },
  {
    date: '2020-03-30'
    , available: false
  },
  {
    date: '2020-03-31'
    , available: false
  },
  {
    date: '2020-04-01'
    , available: false
  },
  {
    date: '2020-04-02'
    , available: false
  },
  {
    date: '2020-04-03'
    , available: false
  },
  {
    date: '2020-04-04'
    , available: false
  },
  {
    date: '2020-04-05'
    , available: false
  },
  {
    date: '2020-04-06'
    , available: true
  },
  {
    date: '2020-04-07'
    , available: true
  },
  {
    date: '2020-04-08'
    , available: true
  },
  {
    date: '2020-04-09'
    , available: true
  },
  {
    date: '2020-04-10'
    , available: false
  },
  {
    date: '2020-04-11'
    , available: true
  },
  {
    date: '2020-04-12'
    , available: false
  },
  {
    date: '2020-04-13'
    , available: false
  },
  {
    date: '2020-04-14'
    , available: true
  },
  {
    date: '2020-04-15'
    , available: true
  },
  {
    date: '2020-04-16'
    , available: true
  },
  {
    date: '2020-04-17'
    , available: false
  },
  {
    date: '2020-04-18'
    , available: false
  },
  {
    date: '2020-04-19'
    , available: false
  },
  {
    date: '2020-04-20'
    , available: true
  },
  {
    date: '2020-04-21'
    , available: true
  },
  {
    date: '2020-04-22'
    , available: true
  },
  {
    date: '2020-04-23'
    , available: true
  },
  {
    date: '2020-04-24'
    , available: false
  },
  {
    date: '2020-04-25'
    , available: false
  },
  {
    date: '2020-04-26'
    , available: false
  },
  {
    date: '2020-04-27'
    , available: true
  },
  {
    date: '2020-04-28'
    , available: true
  },
  {
    date: '2020-04-29'
    , available: true
  },
  {
    date: '2020-04-30'
    , available: true
  }
]

exports.seed = function(knex) {
   return knex('range')
    .where({
      name: 'SATLSTO:n ampumarata'
    }).select('id')
  .then(ranges => {
    const range_id = ranges.pop().id
    reservations.forEach(reservation => reservation.range_id = range_id)
    return knex('range_reservation')
      .insert(reservations)
   })
}
