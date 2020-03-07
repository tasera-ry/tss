const casual = require('casual')

casual.seed(0)

exports.seed = function(knex) {
  return knex('scheduled_range_supervision')
    .select('id')
    .then(ids => {
      return ids.map(id => casual.range_supervision(id.id))
    }).then(supervisions => knex('range_supervision')
            .insert(supervisions))
}


casual.define('range_supervision', function(supervisionId) {
  return {
    scheduled_range_supervision_id: supervisionId
    , range_supervisor: 'absent'
    , notice: casual.description.substring(0, 255)
  }
})
