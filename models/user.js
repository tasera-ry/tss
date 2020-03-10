const path = require('path')
const root = path.join(__dirname, '..')
const validate = require('validate.js')
const knex = require(path.join(root, 'knex', 'knex'))
const _ = require('lodash')

/** 
 * Create a new user.
 *
 * @param {object} user - User's properties, { id?, name, digest, role, phone? }
 * @return {Promise<number[]>} The added users id
 *
 * @example
 * exports.create({ name: 'Mark', digest:'password_digest', role:'superuser'})
 */
exports.create = function createUser(user) {
  /* TODO allow insertion of multiple users at once */
  const universal = _.pick(user, 'name', 'digest', 'role')
  const supervisor = _.pick(user, 'phone')
  
  return knex.transaction(trx => {
    return trx
      .returning('id')
      .insert(universal)
      .into('user')
      .then(ids => {
        return user.role !== 'supervisor'
          ? new Promise((resolve, reject) => resolve(ids))
          : (trx('supervisor')
             .returning('user_id')
             .insert({
               user_id: ids.pop()
               , phone: supervisor.phone
             }))
      }).then(trx.commit)
      .catch(trx.rollback)
    /* TODO handle connection errors, logic error handling belongs at service
     * level */
  }).catch(console.error)
}

/**
 * Get the users matching a key.
 *
 * @param {object} key - Identifying key, { id?, name?, digest?, role? }
 * @return {Promise<object[]>} Users that matched the key
 *
 * @example
 * exports.get({ name: 'Mark' })
 */
exports.get = function getUser(key) {
  return knex('user')
    .where(key)
  /* TODO handle connection errors, logic error handling belongs at service
   * level */
    .catch(console.error)
}

/**
 * Get the users matching a key along with all of their properties.
 *
 * @param {object} key - Identifying key, { id?, name?, digest?, role?, phone?}
 * @return {Promise<object[]>} Users that matched the key
 *
 * @example
 * exports.getWithProperties({ phone:'0400-123753 })
 */
exports.getWithProperties = function getWithProperties(key) {
  return knex('user')
    .join('supervisor', 'user_id', 'id')
    .where(key)
  /* TODO handle connection errors */
    .catch(console.error)
}

/**
 * Delete the users matching a key.
 *
 * @param {object} key - Identifying key, { id?, name?, digest?, role? }
 *
 * @return {Promise<number>} Count of deleted users
 *
 * @example
 * exports.del({ name: 'Mark })
 */
exports.del = function deleteUser(key) {
  /* TODO Allow deleting based on a (supervisors) phone number */
  return knex.transaction(trx => {
    return trx('user')
      .where(key)
      .del()
      .then()
      .then(trx.commit)
      .catch(trx.rollback)
    /* TODO handle connection errors, logic error handling belongs at service
     * level */
  }).catch(console.error)
}

/**
 * Update users info.
 *
 * @param {object} current - The current identifying info of user(s)
 * @param {object} update - New information for the user(s)
 *
 * @return {Promise<number>} Count of rows updated
 *
 * @example
 * exports.update({ name: 'Mark }, {digest: 'new_password_digest' })
 */
exports.update = function updateUser(current, update) {
  return new Promise(function(resolve, reject) {
    if(validate.isDefined(update.id)) {
      reject('User\'s id may not be updated: ' + JSON.stringify(update))
    }

    if(validate.isDefined(update.role)) {
      reject('User\'s role may not be updated: ' + JSON.stringify(update))
    }

    /* TODO, supervisor's (phone)numbers can only be updated if you query with
     * their id. Refactor this to allow phone number updates when querying by
     * username or other fields.
     */

    /* TODO A where that gets picked into a {} will match every row in the
     * table, which can be a bit dangerous.
     */
    const universalWhere   = _.pick(current, 'id', 'name', 'role', 'digest')
    const universalUpdate  = _.pick(update, 'name', 'digest')
    const supervisorWhere  = _.pick(current, 'id', 'phone')
    const supervisorUpdate = _.pick(update, 'phone')
    
    return knex.transaction(trx => {
      return trx('user')
        .where(universalWhere)
        .update(universalUpdate)
      /* TODO phone number updates */
      //        .then((updated) => {
      //          return supervisorUpdate = {}
      //            ? updated
      //            : (trx('supervisor')
      //               .where(supervisorWhere)
      //               .update(supervisorUpdate))
        .then(trx.commit)
        .catch(trx.rollback)
      /* TODO handle connection errors, logic error handling belongs at service
       * level */
    }).catch(console.error)
      .then(resolve)
      .catch(reject)
  })
}
