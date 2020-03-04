exports.up = function(knex) {
  return knex.schema.raw("create type role as enum('superuser', 'supervisor')")
    .createTable('user', user => {
      user.increments()
      user.string('name').notNullable()
      user.binary('digest', 184).notNullable()
      user.enu('role'
                , ['superuser', 'supervisor']
                , { useNative: true, existingType: true, enumName: 'role' })
        .notNullable()
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTable('user')
    .raw("drop type role")
}
