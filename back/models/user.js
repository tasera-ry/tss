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
      email: {},
    };
  
    const associationConstraints = {
      phone: {},
    };
  
    const officerConstraints = {
      associationId: {},
    };
  
    const general = validate.cleanAttributes(user, userConstraints);
    const association = validate.cleanAttributes(user, associationConstraints);
    const officer = validate.cleanAttributes(user, officerConstraints);
  
    return await knex.transaction((trx) => {
      return trx
        .returning('id')
        .insert(general)
        .into('user')
        .then((ids) => {
          const id = ids[0].id;
          if (user.role === 'association') {
            return trx
              .returning('user_id')
              .insert({
                user_id: id,
                phone: association.phone,
              })
              .into('association')
              .then(() => id);
          }
  
          if (user.role === 'rangeofficer') {
            return trx
              .returning('rangeofficer_id')
              .insert({
                rangeofficer_id: id,
                association_id: officer.associationId,
              })
              .into('association_rangeofficers')
              .then(() => id);
          }
          return id;
        })
        .then(trx.commit)
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
      .leftJoin('association', 'association.user_id', 'user.id')
      .where(key)
      .select(fields);
  },

  /**
   * Get the users matching case insensitive name.
   *
   * @param {string} name - Identifying user name
   * @param {object} fields - Attributes about the user to select { id?, name?, digest?, role? , phone? }
   * @return {Promise<object[]>} Users that matched the key
   *
   * @example
   * model.read('Mark', ['role'])
   */
  readCaseInsensitive: async function readUserCaseInsensitive(name, fields) {
    return knex('user')
      .leftJoin('association', 'association.user_id', 'user.id')
      .where('name', 'ILIKE', name)
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
    const user = _.pick(
      update,
      'name',
      'digest',
      'email',
      'role',
      'reset_token',
      'reset_token_expire'
    );
    const rangeofficer = _.pick(update, 'associationId');

    const association = _.pick(update, 'role').role == 'association';

    const id = await model.read(current, ['id']).then((rows) => rows[0]);

    if (!id) {
      const err = Error('Didn\'t identify user(s) to update');
      err.name = 'Unknown user';
      throw err;
    }

    return await knex.transaction((trx) => {
      return trx('user')
        .where(id)
        .update(user)
        .then((updates) => {
          // Rangeofficers need association
          if (_.isEmpty(rangeofficer) === false) {
            return trx('association_rangeofficers')
              .select()
              .where('rangeofficer_id', id.id)
              .then(function (rows) {
                if (rows.length === 0) {
                  // Rangeofficer id not yet in table, insert
                  return trx('association_rangeofficers').insert({ rangeofficer_id: id.id, association_id: rangeofficer.associationId });
                } else {
                  // Duplicate id found, update
                  return trx('association_rangeofficers').where('rangeofficer_id', id.id).update({ association_id: rangeofficer.associationId });
                }
              });
          }
          if (association) {
            return trx('association')
              .select()
              .where('user_id', id.id)
              .then(function (rows) {
                if (rows.length === 0) {
                  // Association id not yet in table, insert
                  return trx('association').insert({ user_id: id.id });
                }
                // Phone number is not currently used for anything, no need to update existing association
              });
          }
          return updates;
        })
        .then(trx.commit)
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
    return await knex.transaction((trx) => {
      return trx('user').where(user).del().then(trx.commit).catch(trx.rollback);
    });
  },
  /**
   * Get email by user key
   * @param {object} key - Users' identifying info.
   * @return {Promise<json>} - Email address of the user
   */
  getEmail: async function getUserEmail(key) {
    return await knex.from('user').select('email').where({ id: key }).first();
  },
  /**
   * Get superuser ids
   * @return {Promise<object>} - Keys of superusers
   */
  getSuperusers: async function getSuperusers() {
    return await knex.from('user').pluck('id').where({ role: 'superuser' });
  },

  /**
   * Get rangeofficer users that match the association id
   * @param {number} associationId - The association id
   * @return {Promise<number[]>} - Keys of rangeofficers
   */
  getRangeOfficers: async function getRangeOfficers(associationId) {
    return await knex
      .from('user')
      .leftJoin(
        'association_rangeofficers',
        'user.id',
        'association_rangeofficers.rangeofficer_id'
      )
      .where({ 'association_rangeofficers.association_id': associationId });
  },

  getAssociation: async function getAssociation(id) {
    return await knex
      .from('association_rangeofficers')
      .where({ rangeofficer_id: id })
      .select('association_id');
  },
};

module.exports = model;
