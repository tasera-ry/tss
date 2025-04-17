exports.up = function (knex) {
  return knex.schema.createTable('default_hours', (table) => {
    table.integer('id').primary();
    table.time('open').notNullable();
    table.time('close').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('default_hours');
};

exports.seed = function (knex) {
  return knex('default_hours').insert([
    { id: 1, open: '09:00:00', close: '17:00:00' },
  ]);
};

