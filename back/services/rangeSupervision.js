const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

// Returns a plain id even if it is wrapped like { scheduled_range_supervision_id: 123 }
function unwrapId(value, field) {
  if (value !== null && typeof value === 'object' && field in value) {
    return value[field];
  }
  return value;
}

const service = {
  /**
   * Create a new supervision.
   *
   * @param {object} info - The properties of the new supervision { scheduled_range_supervision_id, range_supervisor, notice?}
   * @return {Promise<scheduled_range_supervision_id:number>} scheduled_range_supervision_id
   *
   */
  create: async function createSupervision(info) {
    return (await models.rangeSupervision.create(info)).pop();
  },

    
  /**
   * Get the supervisions matching a key.
   *
   * The scheduled_range_supervision_id may be given either as a plain number
   * or wrapped in an object like { scheduled_range_supervision_id: 123 }.
   * A wrapped id is unwrapped to a plain number before the query, because
   * the database column is an integer.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id?, range_supervisor?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the key
   *
   */
  read: async function readSupervision(key) {
    const picked = _.pick(
      key,
      'scheduled_range_supervision_id',
      'range_supervisor',
      'notice',
    );

    // Make sure the id is a plain number and not a wrapped object
    if (picked.scheduled_range_supervision_id !== undefined) {
      picked.scheduled_range_supervision_id = unwrapId(
        picked.scheduled_range_supervision_id,
        'scheduled_range_supervision_id',
      );
    }

    return models.rangeSupervision.read(picked);
  },

  /**
   * Get the supervisions matching a user key.
   *
   * @param {object} key - Identifying user key, { id?, name?, digest?, role?, phone? }
   * @param {object} fields - Attributes about the supervision to select { scheduled_range_supervision_id?, range_supervisor?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the user key
   *
   */
  userSupervisions: async function getUserSupervisions(key, fields) {
    return (await models.rangeSupervision.userSupervisions(_.pick(key, 'id', 'name', 'role', 'phone', 'email'), fields));
  },

  associationSupervisions: async function getAssociationSupervisions(key, fields) {
    return (await models.rangeSupervision.associationSupervisions(_.pick(key, 'association'), fields));
  },

  /**
   * Update a supervision events' info.
   *
   * @param {object} current - The current identifying info of the supervision. { scheduled_range_supervision_id }
   * @param {object} update - New information for the supervision { range_supervisor?, notice? }
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   */
  update: async function updateSupervision(key, updates) {
    return models.rangeSupervision.update(key, updates);
  },

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
  delete: async function deleteSupervision(key) {
    return models.rangeSupervision.delete(key);
  },
};

module.exports = service;
