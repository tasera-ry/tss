const casual = require('casual')
const moment = require('moment')
const _ = require('lodash')

casual.seed(0)

exports.seed = function(knex) {
  return knex('range')
    .select('id')
    .then(ranges => {
      return _.flatten(
        ranges.map(range => {
          const dateIterator = moment.prototype.add.bind(
            moment('2018-12-31')
            , 1
            , 'days')
          return _.times(565 , _.partial(
            casual.range_reservation
            , range.id
            , dateIterator))
        }))
    }).then(reservations => knex('range_reservation')
            .insert(reservations))
}

casual.define('range_reservation', function(rangeId, dateFn) {
  return {
    range_id: rangeId,
    date: dateFn().format('YYYY-MM-DD'),
    available: !!casual.integer(0, 3)
  }
})
