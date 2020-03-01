exports.up = function(knex) {
  return knex.schema
    .createTable('range_reservation', reservation => {
      reservation.increments()
      reservation.integer('range_id')
        .references('id')
        .inTable('range')
        .notNullable()
      reservation.date('date')
        .unique()
        .notNullable()
      reservation.boolean('available')
        .notNullable()
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTable('range_reservation')
}
