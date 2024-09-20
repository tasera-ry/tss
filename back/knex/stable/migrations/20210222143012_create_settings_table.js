
exports.up = function(knex) {
  return knex.schema.createTable('settings', table => {
    table.string('setting_name').primary();
    table.json('setting_value').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('settings');
};
