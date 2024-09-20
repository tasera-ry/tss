exports.up = function(knex) {
  return knex.schema.table('user', table => {
    table.string('reset_token', 128);
  })
};

exports.down = function(knex) {
  return knex.schema.table('user', table => {
    table.dropColumn('reset_token');
  })
};