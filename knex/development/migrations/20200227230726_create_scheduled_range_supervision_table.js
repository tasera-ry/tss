exports.up = function(knex) {
  return knex.schema
    .createTable('scheduled_range_supervision', schedule => {
      schedule.increments()
      schedule.integer('range_reservation_id')
        .references('id')
        .inTable('range_reservation')
        .notNullable()
      schedule.integer('supervisor_id')
        .references('user_id')
        .inTable('supervisor')
      schedule.time('open')
        .notNullable()
      schedule.time('close')
        .notNullable()
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTable('scheduled_range_supervision')
}
