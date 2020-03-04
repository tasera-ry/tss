const casual = require('casual')
const moment = require('moment')
const _ = require('lodash')

exports.seed = function(knex) {
  return knex('range_reservation')
    .del()
    .then(() => {
      return knex
        .select('id')
        .from('range')
        .then(ranges => {
          return Promise.all(
            ranges.map(range => {
              return populateRangeReservations(knex, range.id)
            }))
        })
    })
}

const populateRangeReservations = (knex, range_id) => {
  const startingDate = moment('2020-01-01')
  const momentAdder = moment.prototype.add.bind(startingDate)
  const dayAdder = _.partial(momentAdder, 1, 'days')
  const reservations = _.times(150, _.partial(casual.range_reservation, range_id, dayAdder))

  return knex('range_reservation')
    .insert(reservations)
}

casual.define('range_reservation', function(range_id, date_fn) {
  return {
    range_id: range_id,
    date: date_fn().format('YYYY-MM-DD'),
    available: !!casual.integer(0, 3)
  }
})
