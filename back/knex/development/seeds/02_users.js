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
	const listedUsersAmount = Math.min(config.seeds.users, 50);

	// do we really need terminal spinners?
	const generateUsers = Promise.all(_.times(config.seeds.users, casual._user));
	ora.promise(generateUsers, `Generating ${config.seeds.users} users`);
	const users = await generateUsers;

	const head = _.take(users, listedUsersAmount).map(
		_.partialRight(_.pick, ['name', 'role', 'password', 'email'])
	);
	// simplify JSON.stringify
	console.log(`First ${listedUsersAmount} users:\n${JSON.stringify(head, null, 2)}`);

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
