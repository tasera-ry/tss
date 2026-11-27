/* TODO
 * Replace validations with validator.js
 */
const _ = require('lodash');
const validate = require('validate.js');

const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

/**
 * B10 (#464): a track officer may only be marked present while the range
 * officer is on site, except on tracks with requires_range_officer = false
 * (Pasi Autio, 8.10.2026). The effective range-officer state is derived the
 * same way the day views derive it: a closed reservation means closed, a
 * missing range_supervision row means absent, otherwise the stored enum.
 *
 * 'confirmed' and 'not confirmed' mean the officer is booked but not here,
 * so they count as away for a write: the display rule lets future days show
 * as usable (unavailableReason in trackViewTypes.ts), but a member cannot
 * shoot before the officer arrives.
 */
async function assertRangeOfficerPresent(scheduledRangeSupervisionId, trackId) {
  const track = await knex('track')
    .where('id', trackId)
    .first('requires_range_officer');

  if (track && track.requires_range_officer === false) {
    return;
  }

  const day = await knex({ srs: 'scheduled_range_supervision' })
    .join('range_reservation as rr', 'rr.id', 'srs.range_reservation_id')
    .leftJoin('range_supervision as rs', 'rs.scheduled_range_supervision_id', 'srs.id')
    .where('srs.id', scheduledRangeSupervisionId)
    .first('rr.available', 'rs.range_supervisor');

  const officerPresent =
    day && day.available !== false && day.range_supervisor === 'present';

  if (!officerPresent) {
    const err = Error('Track officer present requires the range officer to be present');
    err.name = 'Range officer not present';
    throw err;
  }
}

const model = {
  /**
   * Create a new supervision event for track
   *
   * @param {object} supVis - supervision properties, { scheduled_range_supervision_id, track_id, track_supervisor, visitors?, notice? }
   * @return {Promise<[{scheduled_range_supervision_id:number, track_id:number}]>} The combined key for track supervision range_supervision_id, track_id
   *
   * @example
   * model.create({ scheduled_range_supervision_id:1, track_id:1, track_supervisor:'present'})
   */
  create: async function createSupervision(supVis) {
    const supervisionConstraints = {
      scheduled_range_supervision_id: {},
      track_id: {},
      track_supervisor: {},
      visitors: {},
      notice: {}
    };

    //check if already exists
    const id = await model
      .read(supVis, ['scheduled_range_supervision_id', 'track_id'])
      .then(rows => rows[0]);

    if(id) {
      const err = Error('Supervision even already exists');
      err.name = 'Supervision exists';
      throw err;
    }

    const general = validate.cleanAttributes(supVis, supervisionConstraints);

    if (general.track_supervisor === 'present') {
      await assertRangeOfficerPresent(
        general.scheduled_range_supervision_id,
        general.track_id
      );
    }

    return await knex.transaction(trx => {
      return trx
        .returning(['scheduled_range_supervision_id','track_id'])
        .insert(general)
        .into('track_supervision')
        .catch(trx.rollback);
    });
  },

  /**
   * Get the supervisions matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id?, track_id?, track_supervisor?, visitors?, notice? }
   * @param {object} fields - Attributes about the supervision to select { scheduled_range_supervision_id?, track_id?, track_supervisor?, visitors?, notice? }
   * @return {Promise<object[]>} Supervisions that matched the key
   *
   * @example
   * model.read({ scheduled_range_supervision_id:1, track_id:1 }, ['track_supervisor'])
   * model.read({ track_id:1} )
   */
  read: async function readSupervision(key, fields) {
    return knex('track_supervision')
      .where(key)
      .select(fields);
  },

  /**
   * Update a supervision events' info.
   *
   * @param {object} current - The current identifying info of the supervision. { scheduled_range_supervision_id, track_id }
   * @param {object} update - New information for the supervision { track_supervisor?, visitors?, notice? }
   *
   * @return {Promise<number[]>} Count of rows updated
   *
   * @example
   * model.update({ scheduled_range_supervision_id:1, track_id:1 }, { track_supervisor: 'absent' })
   */
  update: async function updateSupervision(current, update) {
    const supVis = _.pick(update, 'track_supervisor', 'visitors', 'notice');

    const id = await model
      .read(current, ['scheduled_range_supervision_id', 'track_id'])
      .then(rows => rows[0]);

    if(!id) {
      const err = Error('Didn\'t identify supervision(s) to update');
      err.name = 'Unknown supervision';
      throw err;
    }

    if(supVis.track_supervisor === 'present') {
      // B10 (#464) gates a change into 'present', not every write that
      // carries it: the scheduling view reads each stored status and sends
      // it back when a day is saved, so re-saving a day whose track officer
      // is already marked present must stay possible even once the range
      // officer has left.
      const [stored] = await model.read(current, ['track_supervisor']);

      if (stored && stored.track_supervisor !== 'present') {
        await assertRangeOfficerPresent(
          current.scheduled_range_supervision_id,
          current.track_id
        );
      }
    }

    return await knex.transaction(trx => {
      return trx('track_supervision')
        .where(id)
        .update(supVis)
        .catch(trx.rollback);
    });
  },

  /**
   * Delete the trackSupervision event matching a key.
   *
   * @param {object} key - Identifying key, { scheduled_range_supervision_id, track_id }
   * @return {Promise<number[]>} Count of deleted supervisions
   *
   * @example
   * model.delete({ scheduled_range_supervision_id:1, track_id:1 })
   */
  delete: async function deleteSupervision(supVis) {
    return await knex.transaction(trx => {
      return trx('track_supervision')
        .where(supVis)
        .del()
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }
};

module.exports = model;
