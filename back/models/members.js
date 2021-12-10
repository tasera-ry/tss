const validate = require('validate.js');

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
      .join('user', 'members.user_id', 'user.id')
      .where(key)
      .select(fields)
      .orderBy('user_id');
  },

  update: async function updateMembers(current, update) {
    const membersConstraints = {
      user_id: {},
      members: {},
      supervisors: {},
      raffle: {},
    };

    const members = validate.cleanAttributes(update, membersConstraints);

    //exists
    const id = await model
      .read(current, ['user_id'])
      .then(rows => rows[0]);

    if(!id) {
      const err = Error('Didn\'t identify id(s) to update');
      err.name = 'Unknown id';
      throw err;
    }

    return await knex.transaction(trx => {
      return trx('members')
        .where(id)
        .update(members);
    });
  }
};

module.exports = model;
