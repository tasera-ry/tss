const _ = require('lodash');

const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  create: async function ccreateMembers(membersInfo) {
    const membersConstraints = {
      user_id: {},
      members: {},
      associations: {}
    };

    const members = _.pick(membersInfo, Object.keys(membersConstraints));

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
      associations: {},
      raffle: {},
    };

    const members = _.pick(update, Object.keys(membersConstraints));

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
