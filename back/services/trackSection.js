const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  /**
   * Get the track sections matching a key.
   *
   * @param {object} key - Identifying key, { id?, track_id? }
   * @return {Promise<object[]>} Sections that matched the key
   */
  read: async function readSection(key) {
    return models.trackSection.read(_.pick(key, 'id', 'track_id'));
  }
};

module.exports = service;
