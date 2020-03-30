const path = require('path')
const root = path.join(__dirname, '..', '..', '..')
const config = require(path.join(root, 'config'))

const _ = require('lodash')


const casual = require('casual')
const bcrypt = require('bcryptjs')

casual.seed(0)

exports.seed = function(knex) {
  const users = _.times(config.seeds.users, casual._user)

  return knex('user')
    .insert(users)
    .returning(['id', 'role'])
    .then(users => {
      return users.filter(user => user.role === 'supervisor')
        .map(user => {
          return {
            user_id: user.id
            , phone: casual.phone
          }
        })
    })
    .then(supervisors => {
      return knex('supervisor')
        .insert(supervisors)
    })
}

casual.define('user', function() {
  const username = casual.username
  const password = casual.password
  const role = casual.integer(0, 4) ? 'supervisor' : 'superuser'

  console.log(JSON.stringify({
    name: username
    , password: password
    , role: role
  }))

  return {
    name: username
    , digest: bcrypt.hashSync(password, 0)
    , role:role
  }
})
