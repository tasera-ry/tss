// NOTE: This file used to generate lots of users randomly. We (tss7) changed it to not be random.
// All users are in const users; variable.
// We are leaving the randomized user code commented out, in case it is useful to someone in the future. But it probably won't be.

const path = require('path');
// could this be a constant somewhere?
const root = path.join(__dirname, '..', '..', '..');
const config = require(path.join(root, 'config'));
const _ = require('lodash');

const casual = require('casual');
const bcrypt = require('bcryptjs');
const ora = require('ora');

function getRandomRole() {
	const roles = ['superuser', 'association', 'rangeofficer'];
	const randomIndex = Math.floor(Math.random() * roles.length);
	return roles[randomIndex];
}

casual.seed(config.seeds.seed);
exports.seed = async function (knex) {

	// const listedUsersAmount = Math.min(config.seeds.users, 50);
	// const generateUsers = Promise.all(_.times(config.seeds.users, casual._user));
	// ora.promise(generateUsers, `Generating ${config.seeds.users} users`);
	// const users = await generateUsers;

	// Actual users for dev environment
	const users = [
		{
			name: 'DevAssociation',
			password: '5Effie38',
			digest: '$2a$10$oE0o638BBP/SkL2MQ0jEQeIxh6iKTkLoGaq/Cv6PuEzgeoqZTW4.e',
			phone: '905-680-0458',
			email: 'DevAssociation@yahoo.com',
			role: 'association'
		},
		{
			name: 'DevSuperuser',
			password: '2Gordon62',
			digest: '$2a$10$7mUgTdyd9EiWA755lHaxCeS0jqzaJmn7tp2JMK7nIzMqZcOYEuA2.',
			phone: '079-699-6774',
			email: 'DevSuperuser@tss.ca',
			role: 'superuser'
		},
		{
			name: 'DevRangeOfficer1',
			password: '4Jaron49',
			digest: '$2a$10$/udiVo6laqJXbKiLOVQVpenMbQKhykA4n.uOcqKORZS3GgCvu9CNS',
			phone: '788-709-3147',
			email: 'DevRangeOfficer1@hotmail.com',
			role: 'rangeofficer'
		},
		{
			name: 'DevRangeOfficer2',
			password: '4Jaron49',
			digest: '$2a$10$/udiVo6laqJXbKiLOVQVpenMbQKhykA4n.uOcqKORZS3GgCvu9CNS',
			phone: '788-709-3147',
			email: 'DevRangeOfficer2@hotmail.com',
			role: 'rangeofficer'
		},
		{
			name: 'RangemasterDev',
			password: '4Jaron49',
			digest: '$2a$10$/udiVo6laqJXbKiLOVQVpenMbQKhykA4n.uOcqKORZS3GgCvu9CNS',
			phone: '788-709-3147',
			email: 'RangemasterDev@hotmail.com',
			role: 'rangemaster'
		},
	];

	// const head = _.take(users, listedUsersAmount).map(
	// 	_.partialRight(_.pick, ['name', 'role', 'password', 'email'])
	// );
	// simplify JSON.stringify
	// console.log(`First ${listedUsersAmount} users:\n${JSON.stringify(head, null, 2)}`);


	// Insert users
	const insertUsers = Promise.all(
		_.chunk(users, config.seeds.chunkSize).map(async (userChunk) => {
			const users = userChunk.map((user) => _.pick(user, ['name', 'role', 'digest', 'email']));
			const associations = (await knex('user').insert(users).returning(['id as user_id', 'role']))
				.map((user, i) => _.extend(user, _.pick(userChunk[i], ['user_id', 'phone'])))
				.filter((user) => user.role === 'association')
				.map((user) => _.pick(user, ['user_id', 'phone']));

			await knex('association').insert(associations);
		})
	);
	ora.promise(insertUsers, 'Inserting users');
	await insertUsers;

	// // Generate a single user with "rangemaster" role
	// const rangemasterUser = await casual._user();
	// rangemasterUser.role = 'rangemaster';
	// const rangemasterInsert = await knex('user').insert(_.pick(rangemasterUser, ['name', 'role', 'digest', 'email']));

	// ora.promise(
	// 	Promise.resolve(rangemasterInsert),
	// 	'Inserting rangemaster user'
	// );

	// const selectedFields = _.pick(rangemasterUser, ['name', 'role', 'password', 'email']);
	// console.log(`Rangemaster user:\n${JSON.stringify(selectedFields, null, 2)}`);
};

casual.define('user', async function () {
	const password = casual.password;
	return {
		name: casual.username,
		password: password,
		digest: bcrypt.hashSync(password, 0),
		phone: casual.phone,
		email: casual.email,

		role: getRandomRole(),
	};
});
