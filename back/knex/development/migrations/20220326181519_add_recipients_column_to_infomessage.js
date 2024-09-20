
exports.up = function (knex) {
  return knex.schema.table('info_messages', table => {
    table.string('recipients', 128);
  });
};

exports.down = function (knex) {
  return knex.schema.table('info_messages', table => {
    table.dropColumn('recipients');
  });
};
