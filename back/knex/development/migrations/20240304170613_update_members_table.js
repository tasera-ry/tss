exports.up = function (knex) {
	return knex.schema.table('members', (table) => {
		// Rename the old column
		table.renameColumn('supervisors', 'associations');
	});
};

exports.down = function (knex) {
	// revert changes
	return knex.schema.table('members', (table) => {
		table.renameColumn('associations', 'supervisors');
	});
};
