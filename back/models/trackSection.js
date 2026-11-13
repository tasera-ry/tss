const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Get the track sections matching a key.
   *
   * Every track has at least one section. A track that is not subdivided has a
   * single section covering all of it. `position` is the display order within
   * the track, from 1.
   *
   * @param {object} key - Identifying key, { id?, track_id? }
   * @return {Promise<object[]>} Sections that matched the key, in display order
   *
   * @example
   * model.read({ track_id: 1 })
   */
  read: async function readSection(key) {
    return knex('track_section')
      .where(key)
      .select('id', 'track_id', 'position', 'lane_count', 'name', 'description')
      .orderBy(['track_id', 'position']);
  }
};

module.exports = model;
