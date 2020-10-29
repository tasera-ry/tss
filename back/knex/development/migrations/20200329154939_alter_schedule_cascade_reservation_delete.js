exports.up = function(knex) {
  return knex.schema.alterTable('scheduled_range_supervision', supervision => {
    supervision.dropForeign('range_reservation_id')
    supervision.foreign('range_reservation_id')
      .references('id')
      .inTable('range_reservation')
      .onDelete('cascade')
    
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('scheduled_range_supervision', supervision => {
    supervision.dropForeign('range_reservation_id')
    supervision.foreign('range_reservation_id')
      .references('id')
      .inTable('range_reservation')
  })
}
