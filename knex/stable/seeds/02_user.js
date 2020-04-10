const casual = require('casual')

const users = [
  {
    name:'supervisor'
    , digest: 'password'
    , role: 'supervisor'
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
