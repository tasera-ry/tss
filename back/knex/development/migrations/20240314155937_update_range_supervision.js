exports.up = function (knex) {
  return knex.schema.table('range_supervision', (table) => {
    // Add a new column for the rangeofficer id
    table.integer('rangeofficer_id').references('id').inTable('user');
    table.time('arriving_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('range_supervision', (table) => {
    // Add a new column for the rangeofficer id
    table.dropColumn('rangeofficer_id');
    table.dropColumn('arriving_at');
  });
};
