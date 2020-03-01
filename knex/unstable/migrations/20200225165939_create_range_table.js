exports.up = function(knex) {
  return knex.schema
    .createTable('range', range => {
      range.increments()
      range.string('name').notNullable()
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTable('range')
}
