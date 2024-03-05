exports.up = function (knex) {
	return knex.schema.createTable('association_rangeofficers', (table) => {
		table.integer('association_id').references('id').inTable('user').notNullable();
		table.integer('rangeofficer_id').references('id').inTable('user').notNullable();
		table.primary(['association_id', 'rangeofficer_id']);
	});
};

exports.down = function (knex) {
	return knex.shcema.dropTable('association_rangeofficers');
};
