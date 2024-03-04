exports.up = function (knex) {
	return (
		knex.schema
			// Rename the table
			.renameTable('supervisor', 'association')
			// Update the foreign key to cascade on delete
			.alterTable('association', (association) => {
				association.dropForeign('user_id');
				association.foreign('user_id').references('user.id').onDelete('cascade');
			})
	);
};

exports.down = function (knex) {
	return knex.schema
		.alterTable('association', (association) => {
			association.dropForeign('user_id');
			association.foreign('user_id').references('user.id');
		})
		.renameTable('association', 'supervisor');
};
