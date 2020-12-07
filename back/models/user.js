/* TODO
 * Replace validations with validator.js
 */
const _ = require('lodash');
const validate = require('validate.js');

const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Create a new persistent user.
   *
   * @param {object} user - User's properties, { id?, name, digest, role, email, phone? }
   * @return {Promise<number[]>} The added users id
   *
   * @example
   * model.create({ name: 'Mark', digest:'password_digest', role:'superuser'})
   */
  create: async function createUser(user) {
    const userConstraints = {
      id: {},
      name: {},
      digest: {},
      role: {},
      email: {}
    };

    const supervisorConstraints = {
      phone: {}
    };

    const general = validate.cleanAttributes(user, userConstraints);
    const supervisor = validate.cleanAttributes(user, supervisorConstraints);

    return await knex.transaction(trx => {
      return trx
        .returning('id')
        .insert(general)
        .into('user')
        .then(ids => {
          const id = ids[0];
          if(user.role === 'supervisor') {
            return trx
              .returning('user_id')
              .insert({
                user_id: id
                , phone: supervisor.phone
              }).into('supervisor');
          }
          return ids;
        }).then(trx.commit)
        .catch(trx.rollback);
    });
  },

  /**
   * Get the users matching a key.
   *
   * @param {object} key - Identifying key, { id?, name?, digest?, role?, phone? }
   * @param {object} fields - Attributes about the user to select { id?, name?, digest?, role? , phone? }
   * @return {Promise<object[]>} Users that matched the key
   *
   * @example
   * model.read({ name: 'Mark' }, ['role'])
   */
  read: async function readUser(key, fields) {
    return knex('user')
      .leftJoin('supervisor', 'supervisor.user_id', 'user.id')
      .where(key)
      .select(fields);
  },

  /**
   * Update a users' info.
   *
   * @param {object} current - The current identifying info of the user.
   * @param {object} update - New information for the user
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   * @example
   * exports.update({ name: 'Mark }, { digest: 'new_password_digest' })
   */
  update: async function updateUser(current, update) {
    const user = _.pick(update, 'name', 'digest', 'email');
    const supervisor = _.pick(update, 'phone');

    const id = await model
      .read(current, ['id'])
      .then(rows => rows[0]);

    if(!id) {
      const err = Error('Didn\'t identify user(s) to update');
      err.name = 'Unknown user';
      throw err;
    }

    return await knex.transaction(trx => {
      return trx('user')
        .where(id)
        .update(user)
        .then((updates) => {
          if(_.isEmpty(supervisor) === false) {
            return trx('supervisor')
              .where(id)
              .update(supervisor);
          }
          return updates;
        }).then(trx.commit)
        .catch(trx.rollback);
    });
  },

  /**
   * Delete the users matching a key.
   *
   * @param {object} key - Identifying key, { id?, name?, digest?, role?, phone? }
   * @return {Promise<number[]>} Count of deleted users
   *
   * @example
   * exports.del({ name: 'Mark })
   */
  delete: async function deleteUser(user) {
    return await knex.transaction(trx => {
      return trx('user')
        .where(user)
        .del()
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }
};

module.exports = model;
