const casual = require('casual')
const moment = require('moment')

casual.seed(0)

exports.seed = function(knex) {
  const available_reservations = knex('range_reservation')
        .select('id')
        .where({available: true})

  const supervisors = knex('supervisor')
        .select('user_id')

  return Promise.all([available_reservations, supervisors])
    .then(([reservations, supervisors]) => {
      return reservations.map(reservation => casual.scheduled_range_supervision(
        reservation.id
        , supervisors))
    }).then(schedule => knex('scheduled_range_supervision')
            .insert(schedule))
}

casual.define('scheduled_range_supervision', function(reservationId, supervisors) {
  const openTime = casual.integer(0, 22)
  const closeTime = casual.integer(openTime + 1, 23)
  const defineSupervisor = !!casual.integer(0, 3)

  const supervisorId = defineSupervisor
        ? supervisors[casual.integer(0, supervisors.length - 1)].user_id
        : null
  
  return {
    range_reservation_id: reservationId
    , supervisor_id: supervisorId
    , open: `${openTime.toString().padStart(2, '0')}:00:00`
    , close: `${closeTime.toString().padStart(2, '0')}:00:00`
  }
})
