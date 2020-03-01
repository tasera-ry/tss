exports.up = function(knex) {
  return knex.schema
    .raw("create type range_supervisor as enum('absent', 'en route', 'present')")
    .createTable('range_supervision', supervision => {
      supervision.increments()
      supervision.integer('scheduled_range_supervision_id')
        .references('id')
        .inTable('scheduled_range_supervision')
        .notNullable()
      supervision.timestamp('temporal', { useTz: true, precision: 6 })
        .notNullable()
      supervision.enu('range_supervisor'
                      , ['absent', 'en route', 'present']
                      , { useNative: true
                          , existingType: true
                          , enumName: 'range_supervisor' })
        .notNullable()
      supervision.string('notice')
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTable('range_supervision')
    .raw('drop type range_supervisor')
}
