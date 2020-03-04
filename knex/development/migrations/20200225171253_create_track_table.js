exports.up = function(knex) {
  return knex.schema
    .createTable('track', track => {
      track.increments('id')
      track.integer('range_id')
        .references('id')
        .inTable('range')
        .notNullable()
      track.string('name')
        .notNullable()
      track.string('description')
        .notNullable()
    })
}

exports.down = function(knex) {
  return knex.schema.dropTable('track')
}
