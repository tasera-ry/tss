const path = require('path');
const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const service = {
  /**
   * Create a new device.
   *
   * @param {object} device - Device's properties, { device_name, status }
   * @return {Promise<number[]>} The added devices id
   *
   * @example
   * service.create({ device_name: 'Timer 1', status: 'free' })
   */
  create: async function createDevice(deviceInfo) {
    return (await models.devices.create(deviceInfo)).pop();
  },

  /**
   * Get the devices matching a key.
   * @param {object} key - Identifying key, { device.id }
   * @param {string[]} fields - Attributes about the device to select [ device.id?, device_name?, status? ]
   * @return {Promise<object[]>} Devices that matched the key
   *
   * @example
   * service.read({ 'device.id': 8 }, ['status'])
   */
  read: async function readDevice(key, fields) {
    return models.devices.read(key, fields);
  },

  /**
   * Update a devices' info.
   * @param {object} current - The current identifying info of the device. { device.id }
   * @param {object} update - New information for the device
   * @return {Promise<number>} The number of devices updated
   *
   * @example
   * service.update({ 'device.id': 8 }, { status: 'reserved' })
   */
  update: async function updateDevice(current, update) {
    return models.devices.update(current, update);
  },
  /**
   * Delete a device.
   * @param {number} id - The id of the device to delete
   * @return {Promise<number>} The number of devices deleted
   *
   * @example
   * service.delete(8)
   */

  delete: async function deleteDevice(id) {
    return models.devices.delete(id);
  },
};

module.exports = service;
