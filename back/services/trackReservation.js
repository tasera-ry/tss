const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  /**
   * Get the part-day reservations matching a key.
   *
   * @param {object} key - Identifying key, { date?, track_section_id? }
   * @return {Promise<object[]>} Reservations that matched the key
   */
  read: async function readReservation(key) {
    return models.trackReservation.read(_.pick(key, 'date', 'track_section_id'));
  }
};

module.exports = service;
