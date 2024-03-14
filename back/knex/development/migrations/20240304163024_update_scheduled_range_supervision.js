exports.up = function (knex) {
  return knex.schema.table('scheduled_range_supervision', (table) => {
    // Rename the old column
    table.renameColumn('supervisor_id', 'association_id');

    // Add a new column for the rangeofficer id. Probably not needed???
    // table.integer('rangeofficer_id').references('id').inTable('user');
  });
};

exports.down = function (knex) {
  return knex.schema.table('scheduled_range_supervision', (table) => {
    // Revert changes
    table.renameColumn('association_id', 'supervisor_id');
    // table.dropColumn('rangeofficer_id');
  });
};
