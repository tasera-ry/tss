exports.up = function (knex) {
	return knex.schema.createTable('association_rangeofficers', (table) => {
		// Create a table that connects associations and rangeofficers
		table.integer('association_id').references('id').inTable('user').notNullable();
		table.integer('rangeofficer_id').references('id').inTable('user').notNullable();
		table.primary(['association_id', 'rangeofficer_id']);
	});
};

exports.down = function (knex) {
	// Revert and drop the table
	return knex.shcema.dropTable('association_rangeofficers');
};
