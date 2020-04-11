const path = require('path')

const root = path.join(__dirname, '..')
const models = require(path.join(root, 'models'))
const config = require(path.join(root, 'config', 'config'))

const validate = require('validate.js')
const _ = require('lodash')

const service = {  
  /**
   * Create a new supervision.
   *
   * @param {object} info - The properties of the new supervision { scheduled_range_supervision_id, range_supervisor, notice?}
   * @return {Promise<scheduled_range_supervision_id:number>} scheduled_range_supervision_id
   *
   */
  create: async function createSupervision(info) {
    return (await models.rangeSupervision.create(info)).pop()
  }

  /**
   * Get the supervisions matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id?, range_supervisor?, notice? }
   * @param {object} fields - Attributes about the supervision to select { scheduled_range_supervision_id?, range_supervisor?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the key
   *
   */
  , read: async function readSupervision(key, fields) {
    return (await models.rangeSupervision.read(_.pick(key, 'scheduled_range_supervision_id', 'range_supervisor', 'notice')))
  }

  /**
   * Update a supervision events' info.
   *
   * @param {object} current - The current identifying info of the supervision. { scheduled_range_supervision_id }
   * @param {object} update - New information for the supervision { range_supervisor?, notice? }
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   */
  , update: async function updateSupervision(key, updates) {
    return models.rangeSupervision.update(key, updates)
  }
  
  /** 
   * Delete a supervision.
   *
   * @param {object} key - supervisions' identifying info.
   *
   * @return {Promise<number>} - Count of supervisions deleted
   *
   * @example
   * service.delete({name: 'mark'})
   */
  , delete: async function deleteSupervision(key) {
    return models.rangeSupervision.delete(key)
  }
}

module.exports = service
