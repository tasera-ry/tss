exports.up = function (knex) {
	return knex.schema.renameTable('supervisor', 'associate');
};

exports.down = function (knex) {
	return knex.schema.renameTable('associate', 'supervisor');
};
