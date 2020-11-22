const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));
const config = require(path.join(root, 'config', 'config'));

const validate = require('validate.js');
const _ = require('lodash');

const service = {
  /**
   * Create a new supervision.
   *
   * @param {object} info - The properties of the new supervision { scheduled_range_supervision_id, track_id, track_supervisor, notice?}
   * @return {Promise<[{scheduled_range_supervision_id:number, track_id:number}]>} The combined key for track supervision range_supervision_id, track_id
   *
   */
  create: async function createSupervision(info) {
    return (await models.trackSupervision.create(info)).pop();
  },

  /**
   * Get the supervisions matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id?, track_id?, track_supervisor?, notice? }
   * @param {object} fields - Attributes about the supervision to select { scheduled_range_supervision_id?, track_id?, track_supervisor?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the key
   *
   */
  read: async function readSupervision(key, fields) {
    return (await models.trackSupervision.read(_.pick(key, 'scheduled_range_supervision_id', 'track_id', 'track_supervisor', 'notice')));
  },

  /**
   * Update a supervision events' info.
   *
   * @param {object} current - The current identifying info of the supervision. { scheduled_range_supervision_id, track_id }
   * @param {object} update - New information for the supervision { track_supervisor?, notice? }
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   */
  update: async function updateSupervision(key, updates) {
    return models.trackSupervision.update(key, updates);
  },

  /**
   * Delete a trackSupervision.
   *
   * @param {object} key - trackSupervisions' identifying info.
   *
   * @return {Promise<number>} - Count of trackSupervisions deleted
   *
   * @example
   * service.delete({name: 'mark'})
   */
  delete: async function deleteSupervision(key) {
    return models.trackSupervision.delete(key);
  }
};

module.exports = service;
