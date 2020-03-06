exports.up = function(knex) {
  return knex.schema.createTable('range_supervision_history', history => {
    history.increments()
    history.integer('scheduled_range_supervision_id')
      .references('id')
      .inTable('scheduled_range_supervision')
      .notNullable()
    history.timestamp('updated_at', { useTz: true, precision: 6 })
      .notNullable()
    history.enu('range_supervisor'
                , ['absent', 'confirmed', 'en route', 'present']
                , {useNative:
                   true, existingType: true,
                   enumName: 'range_supervisor'})
      .notNullable()
    history.string('notice')
  })
}

exports.down = function(knex) {
  return knex.schema
      .dropTable('range_supervision_history')
}
