exports.up = function(knex) {
  return knex.schema
    .raw("create type range_supervisor as enum('absent', 'confirmed', 'en route', 'present')")
    .createTable('range_supervision', supervision => {
      supervision.integer('scheduled_range_supervision_id')
        .references('id')
        .inTable('scheduled_range_supervision')
        .notNullable()
        .primary()
      supervision.timestamp('updated_at', { useTz: true, precision: 6 })
        .defaultTo(knex.fn.now())
        .notNullable()
      supervision.enu('range_supervisor'
                      , ['absent', 'confirmed', 'en route', 'present']
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
