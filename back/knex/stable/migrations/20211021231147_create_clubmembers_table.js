
exports.up = function(knex) {
  return knex.schema.createTable('members', table => {
    table.integer('user_id').references('id').inTable('user').primary();
    table.integer('members');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('members');
};
