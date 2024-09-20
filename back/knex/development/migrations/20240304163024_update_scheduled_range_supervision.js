exports.up = function (knex) {
  return knex.schema.table('scheduled_range_supervision', (table) => {
    // Rename the old column
    table.renameColumn('supervisor_id', 'association_id');
  });
};

exports.down = function (knex) {
  return knex.schema.table('scheduled_range_supervision', (table) => {
    // Revert changes
    table.renameColumn('association_id', 'supervisor_id');
  });
};
