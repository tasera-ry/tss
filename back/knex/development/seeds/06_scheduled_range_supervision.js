const casual = require('casual');
const _ = require('lodash');
const ora = require('ora');

const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const config = require(path.join(root, 'config'));

casual.seed(config.seeds.seed);

exports.seed = async function (knex) {
	// can we skip the promise creation somehow?
	const [availableReservations, associations] = await Promise.all([
		knex('range_reservation').select('id').where({ available: true }),
		knex('association').select('user_id'),
	]);

	const generateSchedules = Promise.all(
		availableReservations.map(({ id }) =>
			casual.supervision(id, associations[casual.integer(0, associations.length - 1)].user_id)
		)
	);

	ora.promise(generateSchedules, `Generating ${availableReservations.length} schedules`);

	const schedules = await generateSchedules;

	const insertSchedules = Promise.all(
		_.chunk(schedules, config.seeds.chunkSize).map(async (scheduleBatch) =>
			knex('scheduled_range_supervision').insert(scheduleBatch)
		)
	);

	ora.promise(insertSchedules, 'Inserting schedules');

	await insertSchedules;
};

casual.define('supervision', function (reservationId, association) {
	const openingHour = casual.integer(0, 22);
	const closingHour = casual.integer(openingHour + 1, 23);

	const open = `${openingHour}:${casual.integer(0, 59)}:00`;
	const close = `${closingHour}:${casual.integer(0, 59)}:00`;
	const useAssociation = !!casual.integer(0, 3);

	return {
		range_reservation_id: reservationId,
		association_id: useAssociation ? association : null,
		open: open,
		close: close,
	};
});
