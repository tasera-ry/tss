const casual = require('casual')
const moment = require('moment')

casual.seed(0)

exports.seed = function(knex) {
  const rangeReservation = knex
        .select('id')
        .from('range_reservation')
        .where('available', true)

  const supervisor = knex
        .select('user_id')
        .from('supervisor')

  return Promise.all([rangeReservation, supervisor])
    .then(([rangeReservation, supervisor]) => {
      return rangeReservation.map(reservation => {
        return casual.scheduled_range_supervision(reservation.id, supervisor)
      })
    }).then(schedule => {
      return knex('scheduled_range_supervision')
        .insert(schedule)
    })
}

casual.define('scheduled_range_supervision', function(rangeReservationId, supervisors) {
  const openTime = casual.integer(0, 22)
  const closeTime = casual.integer(openTime + 1, 23)
  const useSupervisor = !!casual.integer(0, 3)

    const supervisorId = useSupervisor
        ? supervisors[casual.integer(0, supervisors.length - 1)].user_id
        : null;
  
  return {
    range_reservation_id:rangeReservationId,
    supervisor_id: supervisorId,
    open: moment(`0001-01-01T${openTime.toString().padStart(2, '0')}:00`).format('HH:MM:SS'),
    close: moment('0001-01-01T' + closeTime.toString().padStart(2, '0')).format('HH:MM:SS')
  }
})
