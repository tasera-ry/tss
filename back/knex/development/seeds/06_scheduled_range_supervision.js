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
	// Opening hours used to be any hour from midnight with any minute, so days
	// came out as 02.51-08.41. The hours were also unpadded, producing strings
	// like "2:5:00". Real hours at Tasera are daytime or evening and land on the
	// hour or half hour: production has shown 17.00-20.00, and the customer's
	// own examples use 10-16.
	const openingHour = casual.integer(9, 17);
	const closingHour = Math.min(openingHour + casual.integer(3, 8), 22);
	const half = () => (casual.integer(0, 1) ? '30' : '00');

	const open = `${String(openingHour).padStart(2, '0')}:${half()}:00`;
	// At the 22:00 cap the half hour would push closing past it.
	const closeMinute = closingHour === 22 ? '00' : half();
	const close = `${String(closingHour).padStart(2, '0')}:${closeMinute}:00`;
	const useAssociation = !!casual.integer(0, 3);

	return {
		range_reservation_id: reservationId,
		association_id: useAssociation ? association : null,
		open: open,
		close: close,
	};
});
