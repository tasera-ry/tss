exports.up = function(knex) {
  return knex.schema
    .raw('create type track_supervisor as enum(\'absent\', \'present\')')
    .createTable('track_supervision', supervision => {
      supervision.integer('scheduled_range_supervision_id')
        .references('id')
        .inTable('scheduled_range_supervision')
        .notNullable();
      supervision.integer('track_id')
        .references('id')
        .inTable('track')
        .notNullable();
      supervision.integer('visitors')
        .notNullable()
        .defaultTo(0);
      supervision.timestamp('updated_at', { useTz: true, precision: 6 })
        .defaultTo(knex.fn.now())
        .notNullable();
      supervision.enu(
        'track_supervisor',
        ['absent', 'present'],
        {
          useNative: true,
          existingType: true,
          enumName: 'track_supervisor'
        }
      ).notNullable();
      supervision.string('notice');
      supervision.primary(['scheduled_range_supervision_id', 'track_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('track_supervision')
    .raw('drop type track_supervisor');
};
