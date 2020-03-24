/* TODO
 * Replace validations with validator.js
 */
const _ = require('lodash')
const validate = require('validate.js')

const path = require('path')
const root = path.join(__dirname, '..')
const knex = require(path.join(root, 'knex', 'knex'))

const model = {
  /** 
   * Create a new track.
   *
   * @param {object} track - Track's properties, { range_id, name, description }
   * @return {Promise<number[]>} The added tracks id
   *
   * @example TODO: range by name?
   * model.create({ range_id: 1, name: 'Shooting track 1', description: '100m Kohdistusrata'})
   */
  create: async function createTrack(trackInfo) {
    console.log("MODEL TRACK CREATE");
    
    const trackConstraints = {
      range_id: {}
      , name: {}
      , description: {}
    }

    const track = validate.cleanAttributes(trackInfo, trackConstraints)
    
    return await knex.transaction(trx => {
      return trx
        .returning('id')
        .insert(track)
        .into('track')
        .then(ids => {
          return ids
        }).then(trx.commit)
        .catch(trx.rollback)
    })
  }

  /**
   * Get the tracks matching a key.
   *
   * @param {object} key - Identifying key, { range_id, id?, name?, description? }
   * @param {string[]} fields - Attributes about the track to select [ id?, range_id?, name?, description? ]
   * @return {Promise<object[]>} Tracks that matched the key
   *
   * @example
   * model.read({ name: 'Shooting track 1' }, ['description'])
   */
  , read: async function readTrack(key, fields) {
    console.log("MODEL TRACK READ");
    
    return knex('track')
      .join('range', 'range.id', 'track.range_id')
      .where(key)
      .select(fields)
  }

  /**
   * Update a tracks' info.
   *
   * @param {object} current - The current identifying info of the track.
   * @param {object} update - New information for the track
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   * @example
   * exports.update({ name: 'Shooting track 1' }, { description: '200m Kohdistusrata' })
   */
  , update: async function updateTrack(current, update) {
    console.log("MODEL TRACK UPDATE");
    //TODO: do we allow range_id to be modified for a track?
    
    const trackConstraints = {
      range_id: {}
      , name: {}
      , description: {}
    }

    const track = validate.cleanAttributes(update, trackConstraints)

    const id = await model
          .read(current, ['id'])
          .then(rows => rows[0])

    return await knex.transaction(trx => {
      return trx('track')
        .where(id)
        .update(track)
    })
  }

  /**
   * Delete the tracks matching a key.
   *
   * @param {object} key - Identifying key, { range_id, id?, name? }
   * @return {Promise<number[]>} Count of deleted tracks
   *
   * @example
   * exports.del({ name: 'Shooting track 1' })
   */
  , delete: async function deleteTrack(key) {
    console.log("MODEL TRACK DELETE");
    
    const ids = await model.read(key, ['id'])
//TODO different
    return await knex.transaction(trx => {
      return Promise.all(
        ids.map(id => {
          return trx('track')
            .where(id)
            .del()
        })).then(trx.commit)
        .catch(trx.rollback)
    })
  }
}

module.exports = model
