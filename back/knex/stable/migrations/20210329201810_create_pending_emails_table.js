
exports.up = function(knex) {
  return knex.schema.createTable('pending_emails', table => {
    table.integer('user_id').unsigned().references('id').inTable('user').onDelete('CASCADE');
    table.string('message_type').notNullable();
    table.integer('schedule_id').unsigned().references('id').inTable('scheduled_range_supervision'); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('pending_emails');
};
