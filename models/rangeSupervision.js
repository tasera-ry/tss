const path = require('path')
const root = path.join(__dirname, '..')
const knex = require(path.join(root, 'knex', 'knex'))
const _ = require('lodash')
const validate = require('validate.js')

const model = {
  /**
   * Create a new supervision event for range
   *
   * @param {object} supVis - supervision properties, { scheduled_range_supervision_id, range_supervisor, notice? }
   * @return {Promise<scheduled_range_supervision_id:number>} scheduled_range_supervision_id
   *
   * @example
   * model.create({ scheduled_range_supervision_id:1, range_supervisor:'present'})
   */
  create: async function createSupervision(supVis) {
    const supervisionConstraints = {
      scheduled_range_supervision_id: {}
      , range_supervisor: {}
      , notice: {}
    }

    //check if already exists
    const id = await model
      .read(supVis, ['scheduled_range_supervision_id'])
      .then(rows => rows[0])

    if(id !== undefined) {
      const err = Error('Supervision event already exists')
      err.name = 'Supervision exists'
      throw err
    }

    const general = validate.cleanAttributes(supVis, supervisionConstraints)

    return await knex.transaction(trx => {
      return trx
        .returning('scheduled_range_supervision_id')
        .insert(general)
        .into('range_supervision')
        .catch(trx.rollback)
    })
  }

  /**
   * Get the supervisions matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id?, range_supervisor?, notice? }
   * @param {object} fields - Attributes about the supervision to select { scheduled_range_supervision_id?, range_supervisor?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the key
   *
   * @example
   * model.read({ scheduled_range_supervision_id:1 }, ['range_supervisor'])
   */
  , read: async function readSupervision(key, fields) {
    return knex('range_supervision')
      .where(key)
      .select(fields)
  }

  /**
   * Update a supervision events' info.
   *
   * @param {object} current - The current identifying info of the supervision. { scheduled_range_supervision_id }
   * @param {object} update - New information for the supervision { range_supervisor?, notice? }
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   * @example
   * model.update({ scheduled_range_supervision_id:1 }, { range_supervisor: 'absent' })
   */
  , update: async function updateSupervision(current, update) {
    const supVis = _.pick(update, 'range_supervisor', 'notice')

    const id = await model
          .read(current, ['scheduled_range_supervision_id'])
          .then(rows => rows[0])

    if(id === undefined) {
      const err = Error('Didn\'t identify supervision(s) to update')
      err.name = 'Unknown supervision'
      throw err
    }

    return await knex.transaction(trx => {
      return trx('range_supervision')
        .where(id)
        .update(supVis)
        .catch(trx.rollback)
    })
  }

  /**
   * Delete the supervision event matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id }
   * @return {Promise<number[]>} Count of deleted supervisions
   *
   * @example
   * model.delete({ scheduled_range_supervision_id:1 })
   */
  , delete: async function deleteSupervision(supVis) {
    return await knex.transaction(trx => {
      return trx('range_supervision')
        .where(supVis)
        .del()
        .then(trx.commit)
        .catch(trx.rollback)
    })
  }
}

module.exports = model
