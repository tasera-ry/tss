const casual = require('casual');
const _ = require('lodash');
const ora = require('ora');

const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const config = require(path.join(root, 'config'));

casual.seed(config.seeds.seed);

exports.seed = async function (knex) {
	const schedule = (
		await knex('scheduled_range_supervision').select('id').whereNotNull('association_id')
	).map(({ id }) => id);

	const generateSupervisions = Promise.all(schedule.map((id) => casual.range_supervision(id)));

	ora.promise(generateSupervisions, `Generating ${schedule.length} range supervisions...`);

	const supervisions = await generateSupervisions;

	const insertSupervisions = Promise.all(
		_.chunk(supervisions, config.seeds.chunkSize).map(async (supervisionChunk) =>
			knex('range_supervision').insert(supervisionChunk)
		)
	);

	ora.promise(insertSupervisions, 'Inserting range supervisions');

	await insertSupervisions;
};

casual.define('range_supervision', async (supervisionId) => {
	const state = ['absent', 'confirmed', 'not confirmed', 'en route', 'present'];

	return {
		scheduled_range_supervision_id: supervisionId,
		range_supervisor: state[casual.integer(0, state.length - 1)],
		notice: casual.description.substring(0, 255),
	};
});
