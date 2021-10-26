const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  //create:
  read: async function readMembers(key, fields) {
    return knex('members')
      .where(key)
      .select(fields);
      .orderBy('user_id');
  }
  //update:
  //delete:


};

module.exports = model;
