// prettier-ignore
exports.up = function(knex) {
  return knex.schema.raw('create type status as enum(\'free\', \'reserved\')')
    .createTable('devices', table => {
      table.increments('id').primary();
      table.string('device_name').notNullable();
      table.enum('status', ['free', 'reserved'], {
        useNative: true,
        existingType: true,
        enumName: 'status'
      }).notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('devices').raw('drop type status');
};
