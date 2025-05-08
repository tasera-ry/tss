exports.up = function (knex) {
  return knex.schema.createTable('default_hours', (table) => {
    table.string('day').primary();
    table.time('open').notNullable();
    table.time('close').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('default_hours');
};

