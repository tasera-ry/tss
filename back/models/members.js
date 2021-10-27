const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  create: async function ccreateMembers(membersInfo) {
    const membersConstraints = {
      user_id: {},
      members: {},
      supervisors: {}
    };

    const members = validate.cleanAttributes(membersInfo, membersConstraints);

    return await knex.transaction(trx => {
      return trx
        .returning('user_id')
        .insert(members)
        .into('members')
        .then(ids => {
          return ids;
        }).then(trx.commit)
        .catch(trx.rollback);
    });
  },

  read: async function readMembers(key, fields) {
    return knex('members')
      .where(key)
      .select(fields)
      .orderBy('user_id');
  }
  //update:
  //delete:


};

module.exports = model;
