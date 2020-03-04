const _ = require('lodash')
const casual = require('casual')
const bcrypt = require('bcryptjs')

casual.seed(0)

exports.seed = function(knex) {
  const users = _.times(30, casual._user)

  const supervisors = users
        .filter(user => user.role === 'supervisor')
        .map(user => {
          return {
            name: user.name,
            phone: casual.phone
          }})

  return knex('supervisor')
    .del()
    .then(() => {
      return knex('user').del()
    }).then(() => {
      return knex('user').insert(users)
    }).then(() => {
      const promises = []
      supervisors.forEach(supervisor => {
        promises.push(updatePhoneNumber(knex, supervisor.phone, supervisor.name))
      })
      return Promise.all(promises)
    })
}

const updatePhoneNumber = (knex, phone, name) => {
  return knex('user')
    .where('name', name)
    .first()
    .then(user => {
      return knex('supervisor')
        .where('user_id', user.id)
        .update('phone', phone)
    })
}

casual.define('user', function() {
  const username = casual.username
  const password = casual.password
  const role = casual.integer(0, 4) ? 'supervisor' : 'superuser'

  console.log(JSON.stringify({ name: username, password: password, role: role }))

  return {
    name: username
    , digest: bcrypt.hashSync(password, 0)
    , role:role
  }
})
