const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  //create:
  read: async function readMembers(key, fields) {
    return knex('members')
      //.leftJoin('supervisor', 'supervisor.user_id', 'user.id')
      .where(key)
      .select(fields);
  },
  //update:
  //delete:


};

module.exports = model;
