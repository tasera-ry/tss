const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const config = require(path.join(root, 'config'));

const bcrypt = require('bcryptjs');

const users = [
  {
    name:'supervisor',
    digest: bcrypt.hashSync('valvoja-hilda', config.bcrypt.hashRounds),
    role: 'supervisor'
    
  },
  {
    name:'superuser',
    digest: bcrypt.hashSync('hallinto-hilda', config.bcrypt.hashRounds),
    role: 'superuser'
  }
];

exports.seed = function(knex) {
  return knex('user')
    .insert(users)
    .returning(['id', 'role', 'email'])
    .then(ids => {
      return ids
        .filter(ids => ids.role === 'supervisor')
        .map(({id}) => {
          return {
            user_id: id,
            phone: undefined
          };
        });
    }).then(supervisors => {
      return knex('supervisor')
        .insert(supervisors);
    });
};
