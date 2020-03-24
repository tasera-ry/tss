const path = require('path')

const root = path.join(__dirname, '..')
const models = require(path.join(root, 'models'))
const config = require(path.join(root, 'config', 'config'))

const validate = require('validate.js')
const _ = require('lodash')

//TODO replace with actual range
const range_id = require(path.join(root, 'config', 'config')).development.range_id

const service = {
  /**
   * Create a new track.
   *
   * @param {object} info - The properties of the new track { range_id, name, description }
   * @return {Promise<number[]>} The added tracks' id
   *
   * @example
   * service.create({ range_id: 1, name: 'Shooting track 1', description: '100m Kohdistusrata' })
   */
  , create: async function createTrack(info) {
    /* TODO
     * Data validation (constraint injection)
     */

    //TODO get id with name?
    const info = Object.assign({range_id: range_id}, info);
    console.log("SERVICE_TRACK_CREATE combined: ",info);

    return models.track.create(info)
  }

  /** 
   * Read (a) tracks' info.
   *
   * @param {object} key - The query information, {} returns all tracks. { range_id, name, description }
   * @param {string[]} fields - Tracks' fields to return
   *
   * @return {Promise<object[]>} List of tracks matching the query
   *
   * @example
   * exports.read({range_id, description: '100m Kohdistusrata' }) - Find all 100m Kohdistusrata
   * exports.read({range_id:1}['name']) - All track names
   */
  , read: async function readTrack(key, fields) {
    /* TODO
     * Data validation (constraint injection)
     */

    return models.track.read(_.pick(key, 'id', 'name', 'description'), fields)
  }

  /**
   * Update a tracks' info.
   *
   * @param {object} key - Tracks' identifying info. { range_id, id?, name?}
   * @param {object} updates - Key-value pairs of the field to update and new value. { name?, description? }
   *
   * @return {Promise<number>} - TODO
   *
   * @example
   * exports.update({ name: 'Shooting track 1' }, { description: 'New and improved' })
   */
  , update: async function updateTrack(key, updates) {

    return models.track.update(key, updates)
  }

    /** 
     * Delete a track.
     *
     * @param {object} key - Tracks' identifying info. { range_id, id?, name?}
     *
     * @return {Promise<number>} - TODO
     *
     * @example
     * service.delete({ name: 'Shooting track 1' })
     */
  , delete: async function deleteTrack(key) {
    /* TODO
     * Data validation (constraint injection)
     */
    return models.track.delete(key)
  }
}

module.exports = service
