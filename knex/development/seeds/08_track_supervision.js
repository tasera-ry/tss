const casual = require('casual')

casual.seed(0)

//scheduled_track_supervision_id, track_id, track_supervisor, notice

exports.seed = function(knex) {
  return knex('track')
    .join('range', 'range.id', 'track.range_id')
    .join('range_reservation', 'range_reservation.range_id', 'range.id')
    .join('scheduled_range_supervision'
          , 'scheduled_range_supervision.range_reservation_id'
          , 'range_reservation.id')
    .column({track_id: 'track.id'
             , scheduled_range_supervision_id: 'scheduled_range_supervision.id' })
    .then(supervisions => {
      return supervisions.map(sup => {
        return casual.track_supervision(sup.track_id, sup.scheduled_range_supervision_id)
      })
    }).then(supervisions => knex('track_supervision')
            .insert(supervisions))
}

casual.define('track_supervision', function(track_id, supervision_id) {
  return {
    scheduled_range_supervision_id: supervision_id
    , track_id: track_id
    , track_supervisor: 'absent'
    , notice: casual.description.substring(0, 255)
  }
})
