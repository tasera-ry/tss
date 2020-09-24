const casual = require('casual')
const bcrypt = require('bcryptjs')

const users = [
  {
    name:'supervisor'
    , digest: bcrypt.hashSync('password', 0)
    , role: 'superuser'
  }
]

exports.seed = function(knex) {
  return knex('user')
    .insert(users)
    .returning('id')
    .then(ids => {
      return ids.map(id => {
        return {
          user_id: id
          , phone: undefined
        }
      })
    }).then(supervisors => {
      return knex('supervisor')
        .insert(supervisors)
    })
}
