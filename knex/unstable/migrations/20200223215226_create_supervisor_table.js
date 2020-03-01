exports.up = function(knex) {
  return knex.schema.createTable('supervisor', supervisor => {
    supervisor.integer('user_id')
      .references('id')
      .inTable('user')
      .primary()
    supervisor.string('phone')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('supervisor')
}
