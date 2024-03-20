const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));
const config = require(path.join(root, 'config', 'config'));

const _ = require('lodash');
const bcrypt = require('bcryptjs');

async function hash(password) {
  return bcrypt.hash(password, config.bcrypt.hashRounds);
}

const service = {
  /**
   * Authenticate a user based on the credentials given.
   *
   * @param {object} credentials - User's name and password.
   * @return {Promise<number|undefined>} Authenticated user's id, undefined when unmatched
   *
   * @example
   * service.authenticate({ name: 'Mark', password: 'mark_password' })
   */
  authenticate: async function authenticateUser(credentials) {
    const users = await models.user.readCaseInsensitive(credentials.name, [
      'id',
      'name',
      'role',
      'digest',
    ]);

    if (users.length === 0) {
      const err = Error('Invalid credentials');
      err.name = 'Invalid credentials';
      throw err;
    }

    const user = users.pop();

    const passwordMatches = await bcrypt.compare(
      credentials.password,
      user.digest.toString()
    );

    if (passwordMatches === false) {
      const err = Error('Invalid credentials');
      err.name = 'Invalid credentials';
      throw err;
    }

    return _.pick(user, 'id', 'name', 'role');
  },

  /**
   * Create a new user.
   *
   * @param {object} info - The properties of the new user { name, password, role, phone? }
   * @return {Promise<number[]>} The added users' id
   *
   * @example
   * service.create({ name: 'Mark', password: 'password', role: 'superuser' })
   */
  create: async function createUser(info) {
    const digest = await hash(info.password);
    delete info.password;
    info.digest = digest;
    return (await models.user.create(info)).pop();
  },

  /**
   * Read (a) users' info.
   *
   * @param {object} key - The query information, {} returns all users.
   *
   * @return {Promise<object[]>} List of users matching the query
   *
   * @example
   * exports.read({ role: 'supervisor' }) - Find all supervisors
   */
  read: async function readUser(key) {
    return (
      await models.user.read(
        _.pick(key, 'id', 'name', 'role', 'phone', 'email')
      )
    ).map(_.partialRight(_.omit, 'digest', 'user_id'));
  },

  /**
   * Update a users' info.
   *
   * @param {object} key - Users' identifying info.
   * @param {object} updates - Key-value pairs of the field to update and new value.
   *
   * @return {Promise<number>} - TODO
   *
   * @example
   * exports.update({ name: 'mark' }, { name:'mark shuttleworth' })
   */
  update: async function updateUser(key, updates) {
    if ('password' in updates) {
      const digest = await hash(updates.password);
      delete updates.password;
      updates.digest = digest;
    }

    return models.user.update(key, updates);
  },

  /**
   * Delete a user.
   *
   * @param {object} key - Users' identifying info.
   *
   * @return {Promise<number>} - Count of users deleted
   *
   * @example
   * service.delete({name: 'mark'})
   */
  delete: async function deleteUser(key) {
    return models.user.delete(key);
  },

  /**
   * Get email by user key
   * @param {object} key - Users' identifying info.
   * @return {Promise<string>} - Email address of the user
   */
  getEmail: async function getUserEmail(key) {
    return (await models.user.getEmail(key)).email;
  },

  /**
   * Get superuser ids
   * @return {Promise<object>} - Keys of superusers
   */
  getSuperusers: async function getSuperusers() {
    return models.user.getSuperusers();
  },

  /**
   *
   * @param {number} associationId
   * @returns {Promise<number[]>} - Keys of rangeofficers
   */

  getRangeOfficers: async function getRangeOfficerIds(associationId) {
    return models.user.getRangeOfficerIds(associationId);
  },
};

module.exports = service;
