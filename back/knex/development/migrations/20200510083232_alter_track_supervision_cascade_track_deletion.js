exports.up = function(knex) {
  return knex.schema.alterTable('track_supervision', supervision => {
    supervision.dropForeign('track_id')
    supervision.foreign('track_id')
      .references('track.id')
      .onDelete('cascade')
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('track_supervision', supervision => {
    supervision.dropForeign('track_id')
    supervision.foreign('track_id')
      .references('track_id')
  })
}
