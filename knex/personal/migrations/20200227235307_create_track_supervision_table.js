exports.up = function(knex) {
  return knex.schema
    .raw("create type track_supervisor as enum('absent', 'present')")
    .createTable('track_supervision', supervision => {
      supervision.increments()
      supervision.integer('scheduled_range_supervision_id')
        .references('id')
        .inTable('scheduled_range_supervision')
        .notNullable()
      supervision.timestamp('temporal', { useTz: true, precision: 6 })
      supervision.enu('track_supervisor'
                      , ['absent', 'present']
                      , { useNative: true
                          , existingType: true
                          , enumName: 'track_supervisor' })
        .notNullable()

      supervision.string('notice')
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTable('track_supervision')
    .raw('drop type track_supervisor')
}
