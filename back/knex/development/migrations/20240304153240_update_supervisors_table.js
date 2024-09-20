exports.up = function (knex) {
	// Rename the table
	return knex.schema.renameTable('supervisor', 'association');
};

exports.down = function (knex) {
	// Revert changes
	return knex.schema.renameTable('association', 'supervisor');
};
