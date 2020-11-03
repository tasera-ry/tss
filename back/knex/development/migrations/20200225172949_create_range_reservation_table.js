exports.up = function(knex) {
  return knex.schema
    .createTable('range_reservation', reservation => {
      reservation.increments();
      reservation.integer('range_id')
        .references('id')
        .inTable('range')
        .notNullable();
      reservation.date('date')
        .notNullable();
      reservation.boolean('available')
        .notNullable();
      reservation.unique(['range_id', 'date']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('range_reservation');
};
