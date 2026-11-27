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
  },

  /**
   * Add a section to a track (#462).
   *
   * @param {object} data - { track_id, name, lane_count, description? }
   * @return {Promise<object>} The section as stored
   */
  create: async function createSection(data) {
    const [track] = await models.track.read({ 'track.id': data.track_id });
    if (!track) throw clientError(400, `Unknown track ${data.track_id}`);
    return models.trackSection.create({
      ..._.pick(data, 'track_id', 'name', 'lane_count', 'description_sv', 'description_en'),
      description: data.description ?? ''
    });
  },

  /**
   * Change a section's name, lanes or description (#462). Fewer lanes are
   * refused while bookings from today on need more.
   *
   * @return {Promise<object|null>} The section, or null if there is none
   */
  update: async function updateSection(id, changes) {
    const result = await models.trackSection.update(
      id, _.pick(changes, 'name', 'lane_count', 'description', 'description_sv', 'description_en'), today());
    if (result.refused) {
      throw clientError(409, 'Bookings need more lanes', { days: result.refused });
    }
    return result.section ?? null;
  },

  /**
   * Delete a section (#462): never a track's last, nor one with bookings from
   * today on. Its past bookings are deleted with it.
   *
   * @return {Promise<boolean>} Whether a section was deleted
   */
  delete: async function deleteSection(id) {
    const result = await models.trackSection.delete(id, today());
    if (result.last) throw clientError(400, 'A track needs at least one section');
    if (result.refused) {
      throw clientError(409, 'The section has bookings', { days: result.refused });
    }
    return result.deleted === true;
  }
};

/** Today in Finland, YYYY-MM-DD, whatever time zone the server runs in. */
function today() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' });
}

function clientError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

module.exports = service;
