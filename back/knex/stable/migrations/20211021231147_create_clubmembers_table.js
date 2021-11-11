
exports.up = function(knex) {
  return knex.schema.createTable('members', table => {
    table.integer('user_id').references('id').inTable('user').primary();
    table.integer('members');
    table.integer('supervisors');
    table.boolean('raffle');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('members');
};
