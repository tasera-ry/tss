const _ = require('lodash')

exports.seed = function(knex) {

  function truncate(table) {
    return knex(table)
      .del()
  }

  const truncateTrackHistory = _.partial(truncate, 'track_supervision_history')
  const truncateTrackSupervision = _.partial(truncate, 'track_supervision')
  const truncateRangeHistory = _.partial(truncate, 'range_supervision_history')
  const truncateRangeSupervision = _.partial(truncate, 'range_supervision')
  const truncateScheduledRangeSupervision = _.partial(truncate, 'scheduled_range_supervision')
  const truncateRangeReservation = _.partial(truncate, 'range_reservation')
  const truncateTrack = _.partial(truncate, 'track')
  const truncateRange = _.partial(truncate, 'range')
  const truncateSupervisor = _.partial(truncate, 'supervisor')
  const truncateUser = _.partial(truncate, 'user')

  return truncateTrackHistory()
    .then(truncateRangeHistory)
    .then(truncateTrackSupervision)
    .then(truncateRangeSupervision)
    .then(truncateScheduledRangeSupervision)
    .then(truncateRangeReservation)
    .then(truncateTrack)
    .then(truncateRange)
    .then(truncateSupervisor)
    .then(truncateUser)
}
