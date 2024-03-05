exports.up = function (knex) {
	return knex.schema.table('scheduled_range_supervision', (table) => {
		// Rename the old column
		table.renameColumn('supervisor_id', 'association_id');

		// Remove the old foreign key
		table.dropForeign(['supervisor_id']);

		// Add the new foreign key
		table
			.integer('association_id')
			.references('user_id')
			.inTable('association')
			// on delete set null from older alter migration
			.onDelete('SET NULL');

		// Add a new column for the rangeofficer id
		table.integer('rangeofficer_id').references('id').inTable('users');
	});
};

exports.down = function (knex) {
	// Revert changes
	return knex.schema.table('scheduled_range_supervision', (table) => {
		table.renameColumn('association_id', 'supervisor_id');
		table.dropForeign(['association_id']);
		table.integer('supervisor_id').references('user_id').inTable('supervisor');
		table.dropColumn('rangeofficer_id');
	});
};
