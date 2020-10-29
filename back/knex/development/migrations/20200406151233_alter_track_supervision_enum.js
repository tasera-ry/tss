exports.up = function(knex) {
  return knex.schema
    .table('track_supervision', function (table) {
      table.dropColumn('track_supervisor')
    })
    .table('track_supervision_history', function (table) {
      table.dropColumn('track_supervisor')
    })
    .raw('drop type track_supervisor')
    .raw("create type track_supervisor_closed as enum('absent', 'present', 'closed')")
    .alterTable('track_supervision', supervision => {
      supervision.enu('track_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'track_supervisor_closed'
      })
      .notNullable()
      .defaultTo('absent')
    })
    .alterTable('track_supervision_history', supervision => {
      supervision.enu('track_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'track_supervisor_closed'
      })
      .notNullable()
      .defaultTo('absent')
    })
};

exports.down = function(knex) {
  return knex.schema
    .table('track_supervision', function (table) {
      table.dropColumn('track_supervisor')
    })
    .table('track_supervision_history', function (table) {
      table.dropColumn('track_supervisor')
    })
    .raw('drop type track_supervisor_closed')
    .raw("create type track_supervisor as enum('absent', 'present')")
    .alterTable('track_supervision', supervision => {
      supervision.enu('track_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'track_supervisor'
      })
      .notNullable()
      .defaultTo('absent')
    })
    .alterTable('track_supervision_history', supervision => {
      supervision.enu('track_supervisor', null, {
        useNative: true,
        existingType: true,
        enumName: 'track_supervisor'
      })
      .notNullable()
      .defaultTo('absent')
    })
};
