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
  create: async function createTrack(info) {
    console.log("SERV TRACK CREATE");

    return (await models.track.create(info)).pop()
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
    console.log("SERV TRACK READ");
    console.log("SERV TRACK key: ",key)
    console.log("SERV TRACK fields: ",fields)

    let combinedKey = key;
    
    //id was ambiguous
    if(key.track_id !== undefined){
      combinedKey = Object.assign({'track.id': key.track_id}, combinedKey);
      combinedKey = _.omit(combinedKey, ['track_id']);
      console.log("SERVICE_TRACK_CREATE combined: ",combinedKey);
    }

    return (await models.track.read(_.pick(combinedKey, 'range_id', 'track.id', 'name', 'description')))
      .map(_.partialRight(_.omit, 'range_id'))
  }

  /**
   * Update a tracks' info.
   *
   * @param {object} key - Tracks' identifying info. { range_id, id?, name?}
   * @param {object} updates - Key-value pairs of the field to update and new value. { name?, description? }
   *
   * @return {Promise<number>} - Count of tracks updated
   *
   * @example
   * exports.update({ name: 'Shooting track 1' }, { description: 'New and improved' })
   */
  , update: async function updateTrack(key, updates) {
    console.log("SERV TRACK UPDATE");
    
    let combinedKey = key;
    
    //id was ambiguous
    if(key.track_id !== undefined){
      combinedKey = Object.assign({'track.id': key.track_id}, combinedKey);
      combinedKey = _.omit(combinedKey, ['track_id']);
      console.log("SERVICE_TRACK_CREATE combined: ",combinedKey);
    }

    return models.track.update(combinedKey, updates)
  }

    /** 
     * Delete a track.
     *
     * @param {object} key - Tracks' identifying info. { range_id, id?, name?}
     *
     * @return {Promise<number>} - Count of tracks deleted
     *
     * @example
     * service.delete({ name: 'Shooting track 1' })
     */
  , delete: async function deleteTrack(key) {
    console.log("SERV TRACK DELETE");
    
    let combinedKey = key;
    
    //id was ambiguous
    if(key.track_id !== undefined){
      combinedKey = Object.assign({'track.id': key.track_id}, combinedKey);
      combinedKey = _.omit(combinedKey, ['track_id']);
      console.log("SERVICE_TRACK_CREATE combined: ",combinedKey);
    }
    
    return models.track.delete(combinedKey)
  }
}

module.exports = service
