/* TODO
 * Replace validations with validator.js
 */
const _ = require('lodash')
const validate = require('validate.js')

const path = require('path')
const root = path.join(__dirname, '..')
const knex = require(path.join(root, 'knex', 'knex'))

const model = {
  /**
   * Create a new supervision event for track
   *
   * @param {object} supVis - supervision properties, { scheduled_range_supervision_id, track_id, track_supervisor, notice? }
   * @return {Promise<[{scheduled_range_supervision_id:number, track_id:number}]>} The combined key for track supervision range_supervision_id, track_id
   *
   * @example
   * model.create({ scheduled_range_supervision_id:1, track_id:1, track_supervisor:'present'})
   */
  create: async function createSupervision(supVis) {
    const supervisionConstraints = {
      scheduled_range_supervision_id: {}
      , track_id: {}
      , track_supervisor: {}
      , notice: {}
    }

    //check if already exists
    const id = await model
      .read(supVis, ['scheduled_range_supervision_id', 'track_id'])
      .then(rows => rows[0])

    if(id !== undefined) {
      const err = Error('Supervision even already exists')
      err.name = 'Supervision exists'
      throw err
    }

    const general = validate.cleanAttributes(supVis, supervisionConstraints)

    return await knex.transaction(trx => {
      return trx
        .returning(['scheduled_range_supervision_id','track_id'])
        .insert(general)
        .into('track_supervision')
        .catch(trx.rollback)
    })
  }

  /**
   * Get the supervisions matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id?, track_id?, track_supervisor?, notice? }
   * @param {object} fields - Attributes about the supervision to select { scheduled_range_supervision_id?, track_id?, track_supervisor?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the key
   *
   * @example
   * model.read({ scheduled_range_supervision_id:1, track_id:1 }, ['track_supervisor'])
   * model.read({ track_id:1} )
   */
  , read: async function readSupervision(key, fields) {
    return knex('track_supervision')
      .where(key)
      .select(fields)
  }

  /**
   * Update a supervision events' info.
   *
   * @param {object} current - The current identifying info of the supervision. { scheduled_range_supervision_id, track_id }
   * @param {object} update - New information for the supervision { track_supervisor?, notice? }
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   * @example
   * model.update({ scheduled_range_supervision_id:1, track_id:1 }, { track_supervisor: 'absent' })
   */
  , update: async function updateSupervision(current, update) {
    const supVis = _.pick(update, 'track_supervisor', 'notice')

    const id = await model
          .read(current, ['scheduled_range_supervision_id', 'track_id'])
          .then(rows => rows[0])

    if(id === undefined) {
      const err = Error('Didn\'t identify supervision(s) to update')
      err.name = 'Unknown supervision'
      throw err
    }

    return await knex.transaction(trx => {
      return trx('track_supervision')
        .where(id)
        .update(supVis)
        .catch(trx.rollback)
    })
  }

  /**
   * Delete the trackSupervision event matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id, track_id }
   * @return {Promise<number[]>} Count of deleted supervisions
   *
   * @example
   * model.delete({ scheduled_range_supervision_id:1, track_id:1 })
   */
  , delete: async function deleteSupervision(supVis) {
    return await knex.transaction(trx => {
      return trx('track_supervision')
        .where(supVis)
        .del()
        .then(trx.commit)
        .catch(trx.rollback)
    })
  }
}

module.exports = model
