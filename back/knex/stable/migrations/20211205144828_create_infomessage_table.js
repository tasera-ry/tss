
exports.up = function(knex) {
  return knex.schema.createTable('info_messages', table => {
    table.increments().primary();
    table.text('message').notNullable();
    table.enum('level', ['info', 'warning', 'error']).notNullable();
    table.date('start').notNullable();
    table.date('end').notNullable();
    table.boolean('show_weekly').notNullable();
    table.boolean('show_monthly').notNullable();
    table.boolean('sticky').notNullable();
  });
};
  
exports.down = function(knex) {
  return knex.schema.dropTable('info_messages');
};
  