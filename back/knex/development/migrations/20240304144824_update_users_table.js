// prettier-ignore
exports.up = function (knex) {
	return (
		knex.schema
			// Add new role types
			.raw('ALTER TYPE role ADD VALUE \'association\'')
			.raw('ALTER TYPE role ADD VALUE \'rangeofficer\'')

			// Update old "supervisor" role to match "association"
			.alterTable('user', (table) => {
				table
					.string('role')
					.where('role', '=', 'supervisor')
					.update('role', 'association')
					.alter();
			})

			// Remove old supervisor role option
			.raw('ALTER TYPE role DROP VALUE \'supervisor\'')
	);
};

// prettier-ignore
exports.down = function (knex) {
	// Revert changes
	return (
		knex.schema
			.raw('ALTER TYPE role ADD VALUE \'supervisor\'')
			.alterTable('user', (table) => {
				table
					.string('role')
					.where('role', '=', 'association')
					.update('role', 'supervisor')
					.alter();
			})
			.raw('ALTER TYPE role DROP VALUE \'association\'')
			.raw('ALTER TYPE role DROP VALUE \'rangeofficer\'')
	);
};
