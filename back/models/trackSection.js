const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Get the track sections matching a key.
   *
   * Every track has at least one section. A track that is not subdivided has a
   * single section with an empty name.
   *
   * @param {object} key - Identifying key, { id?, track_id? }
   * @return {Promise<object[]>} Sections that matched the key, in track order
   *
   * @example
   * model.read({ track_id: 1 })
   */
  read: async function readSection(key) {
    return knex('track_section')
      .where(key)
      .select('id', 'track_id', 'name', 'position', 'lane_count')
      .orderBy(['track_id', 'id']);
  }
};

module.exports = model;
