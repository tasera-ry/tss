
exports.up = function(knex) {
  return knex.schema
    .table('range_supervision', function (table) {
      table.dropColumn('range_supervisor');
    })
    .table('range_supervision_history', function (table) {
      table.dropColumn('range_supervisor');
    })
    .raw('drop type range_supervisor')
    // odd type name for enum
    .raw('create type range_supervisor_not_confirmed as enum(\'absent\', \'confirmed\', \'not confirmed\', \'en route\', \'present\')')
    .alterTable('range_supervision', supervision => {
      supervision.enu('range_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'range_supervisor_not_confirmed'
      })
        .notNullable()
        .defaultTo('absent');
    })
    .alterTable('range_supervision_history', supervision => {
      supervision.enu('range_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'range_supervisor_not_confirmed'
      })
        .notNullable()
        .defaultTo('absent');
    });
};

exports.down = function(knex) {
  return knex.schema
    .table('range_supervision', function (table) {
      table.dropColumn('range_supervisor');
    })
    .table('range_supervision_history', function (table) {
      table.dropColumn('range_supervisor');
    })
    .raw('drop type range_supervisor_not_confirmed')
    .raw('create type range_supervisor as enum(\'absent\', \'confirmed\', \'en route\', \'present\')')
    .alterTable('range_supervision', supervision => {
      supervision.enu('range_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'range_supervisor'
      })
        .notNullable()
        .defaultTo('absent');
    })
    .alterTable('range_supervision_history', supervision => {
      supervision.enu('range_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'range_supervisor'
      })
        .notNullable()
        .defaultTo('absent');
    });
};
