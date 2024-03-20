exports.up = function (knex) {
	return knex.schema.raw(`
			ALTER type role ADD VALUE 'rangeofficer';
			ALTER type role RENAME VALUE 'supervisor' TO 'association';
		`);
};
exports.down = function (knex) {
	// Revert changes
	return knex.schema.raw(`
		ALTER type role RENAME VALUE 'association' TO 'supervisor';
		ALTER type role DROP VALUE 'rangeofficer';
		`);
};
