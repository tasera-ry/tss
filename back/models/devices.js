const validate = require('validate.js');
const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Create a new device.
   *
   * @param {object} device - Device's properties, { device_name, status }
   * @return {Promise<number[]>} The added devices id
   *
   * @example
   * model.create({ device_name: 'Timer 1', status: 'free' })
   */
  create: async function createDevice(deviceInfo) {
    const deviceConstraints = {
      device_name: {},
      status: {},
    };

    const device = validate.cleanAttributes(deviceInfo, deviceConstraints);

    return await knex.transaction((trx) => {
      return trx
        .returning('id')
        .insert(device)
        .into('device')
        .then((ids) => {
          return ids;
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },

  /**
   * Get the devices matching a key.
   * @param {object} key - Identifying key, { device.id }
   * @param {string[]} fields - Attributes about the device to select [ device.id?, device_name?, status? ]
   * @return {Promise<object[]>} Devices that matched the key
   *
   * @example
   * model.read({ 'device.id': 8 }, ['status'])
   */
  read: async function readDevice(key, fields) {
    return knex('device')
      .where({ id: key })
      .select(fields)
      .orderBy('device_name');
  },

  /**
   * Update a devices' info.
   * @param {object} current - The current identifying info of the device. { device.id }
   * @param {object} update - New information for the device
   * @return {Promise<number>} The number of devices updated
   *
   * @example
   * model.update({ 'device.id': 8 }, { status: 'reserved' })
   */
  update: async function updateDevice(current, update) {
    const deviceConstraints = {
      device_name: {},
      status: {},
    };

    const device = validate.cleanAttributes(update, deviceConstraints);

    const id = await model.read(current, ['device.id']).then((rows) => rows[0]);

    if (!id) {
      const error = new Error('Didnt find device to update');
      error.name = 'Unknown device';
      throw error;
    }

    return await knex.transaction((trx) => {
      return trx('device').where(id).update(device);
    });
  },
  /**
   * Delete a device.
   * @param {object} key - Identifying key, { device.id }
   * @return {Promise<number>} The number of devices deleted
   *
   * @example
   * model.delete({ 'device.id': 8 })
   */
  delete: async function deleteDevice(key) {
    return knex.transaction((trx) => {
      return trx('device')
        .where({ id: key })
        .del()
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },
};

module.exports = model;
