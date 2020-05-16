const path = require('path')
const root = path.join(__dirname, '..', '..', '..')
const config = require(path.join(root, 'config'))
const _ = require('lodash')

const casual = require('casual')
const bcrypt = require('bcryptjs')
const ora = require('ora')

casual.seed(config.seeds.seed)
exports.seed = async function(knex) {
  const listedUsers = Math.min(config.seeds.users, 50)

  const generateUsers = Promise.all(_.times(config.seeds.users, casual._user))
  const generateSpinner = ora.promise(
    generateUsers
    , `Generating ${config.seeds.users} users`)
  const users = await generateUsers

  const head = _.take(users, listedUsers)
        .map(_.partialRight(_.pick, ['name', 'role', 'password']))
  console.log(`First ${listedUsers} users:\n${JSON.stringify(head, null, 2)}`)

  const insertUsers = Promise.all(
    _.chunk(users, config.seeds.chunkSize)
      .map(async (userChunk) => {
        const users = userChunk
              .map(user => _.pick(user, ['name', 'role', 'digest']))
        const supervisors =
              (await knex('user')
               .insert(users)
               .returning(['id as user_id', 'role']))
              .map((user, i) => _.extend(user, _.pick(userChunk[i], ['user_id', 'phone'])))
              .filter(user => user.role === 'supervisor')
              .map(user => _.pick(user, ['user_id', 'phone']))

        await knex('supervisor')
          .insert(supervisors)
      }))
  const insertSpinner = ora.promise(insertUsers, 'Inserting users')
  const response = await insertUsers
}

casual.define('user', async function() {
  const password = casual.password
  return {
    name: casual.username
    , password: password
    , digest: bcrypt.hashSync(password, 0)
    , phone: casual.phone
    , role: casual.integer(0, 4) ? 'supervisor' : 'superuser'
  }
})
