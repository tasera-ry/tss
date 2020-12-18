exports.up = function(knex) {
  return knex.schema
    .createTable('track_supervision_history', history => {
      history.increments();
      history.integer('scheduled_range_supervision_id')
        .references('id')
        .inTable('scheduled_range_supervision')
        .notNullable();
      history.integer('track_id')
        .references('id')
        .inTable('track')
        .notNullable();
      history.timestamp('updated_at', { useTz: true, precision: 6 })
        .notNullable();
      history.enu(
        'track_supervisor',
        ['absent', 'present'],
        {
          useNative: true,
          existingType: true,
          enumName: 'track_supervisor'
        }
      ).notNullable();
      history.string('notice');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('track_supervision_history');
};
