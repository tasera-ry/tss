exports.up = function(knex) {
  return knex.schema.alterTable('supervisor', supervisor => {
    supervisor.dropForeign('user_id')
    supervisor.foreign('user_id')
      .references('user.id')
      .onDelete('cascade')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('supervisor', supervisor => {
    supervisor.dropForeign('user_id')
    supervisor.foreign('user_id')
      .references('user.id')
  })
};
