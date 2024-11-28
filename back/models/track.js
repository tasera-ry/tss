/* TODO
 * Replace validations with validator.js
 */
const validate = require('validate.js');

const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Create a new track.
   *
   * @param {object} track - Track's properties, { range_id, name, description }
   * @return {Promise<number[]>} The added tracks id
   *
   * model.create({ range_id: 1, name: 'Shooting track 1', description: '100m Kohdistusrata', short_description: '100m Kohdistus'})
   */
  create: async function createTrack(trackInfo) {
    const trackConstraints = {
      range_id: {},
      name: {},
      description: {},
      short_description: {}
    };

    const track = validate.cleanAttributes(trackInfo, trackConstraints);

    return await knex.transaction(trx => {
      return trx
        .returning('id')
        .insert(track)
        .into('track')
        .then((ids) => {
          return ids[0].id;
        }).then(trx.commit)
        .catch(trx.rollback);
    });
  },

  /**
   * Get the tracks matching a key.
   *
   * @param {object} key - Identifying key, { track.id }
   * @param {string[]} fields - Attributes about the track to select [ track.id?, range_id?, name?, description? ]
   * @return {Promise<object[]>} Tracks that matched the key
   *
   * @example
   * model.read({ 'track.id': 8 }, ['description'])
   */
  read: async function readTrack(key, fields) {
    return knex('track')
      .where(key)
      .select(fields)
      .orderBy('name');
  },

  /**
   * Update a tracks' info.
   *
   * @param {object} current - The current identifying info of the track. { track.id }
   * @param {object} update - New information for the track
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   * @example
   * exports.update({ 'track.id': 8 }, { description: '200m Kohdistusrata' })
   */
  update: async function updateTrack(current, update) {
    const trackConstraints = {
      range_id: {},
      name: {},
      description: {},
      short_description: {}
    };

    const track = validate.cleanAttributes(update, trackConstraints);

    //exists
    const id = await model
      .read(current, ['track.id'])
      .then(rows => rows[0]);

    if(!id) {
      const err = Error('Didn\'t identify track(s) to update');
      err.name = 'Unknown track';
      throw err;
    }

    return await knex.transaction(trx => {
      return trx('track')
        .where(id)
        .update(track);
    });
  },

  /**
   * Delete the tracks matching a key.
   *
   * @param {object} key - Identifying key, { track.id }
   * @return {Promise<number[]>} Count of deleted tracks
   *
   * @example
   * exports.del({ 'track.id': 8 })
   */
  delete: async function deleteTrack(key) {
    const ids = await model.read(key, ['track.id']);

    return await knex.transaction(trx => {
      return Promise.all(
        ids.map(id => {
          return trx('track')
            .where(id)
            .del();
        })).then(trx.commit)
        .catch(trx.rollback);
    });
  }
};

module.exports = model;
