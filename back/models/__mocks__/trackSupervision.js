const _ = require('lodash');
const validate = require('validate.js');

let trackSupervisions = [];

// B10 (#464) rule state: what the real model reads from the track and
// range_supervision tables. Tests seed these with setTrack/setRangeSupervision.
let ruleTracks = {};
let ruleRangeSupervisions = {};

// Mirrors the rule in models/trackSupervision.js: "track officer present"
// requires the range officer, unless the track is marked not requiring one.
async function assertRangeOfficerPresent(scheduledRangeSupervisionId, trackId) {
  const track = ruleTracks[trackId];

  if(track && track.requires_range_officer === false) {
    return;
  }

  const day = ruleRangeSupervisions[scheduledRangeSupervisionId];
  const officerPresent =
    day && day.available !== false && day.range_supervisor === 'present';

  if(!officerPresent) {
    const err = Error('Track officer present requires the range officer to be present');
    err.name = 'Range officer not present';
    throw err;
  }
}

const model = {
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

    if(general.track_supervisor === 'present') {
      await assertRangeOfficerPresent(
        general.scheduled_range_supervision_id,
        general.track_id
      );
    }

    trackSupervisions.push(general);

    return([{
      scheduled_range_supervision_id: general.scheduled_range_supervision_id,
      track_id: general.track_id
    }]);
  },

  read: async function readSupervision(params, fields) {
    const values = trackSupervisions.filter((trackSupervision) => {
      const searchKeys = Object.keys(params);
      let match = true;
      searchKeys.forEach(key => {
        if (params[key] !== trackSupervision[key]) {
          match = false;
        }
      });
      return match;
    });
    
    // The real read maps each matching row onto the requested fields.
    if(fields) return values.map((value) => _.pick(value, fields));

    return values;
  },

  update: async function updateSupervision(current, update) {
    const supVis = _.pick(update, 'track_supervisor', 'visitors', 'notice');

    const exists = (await model.read(current)).length == 1;

    if(!exists) {
      const err = Error('Didn\'t identify supervision(s) to update');
      err.name = 'Unknown supervision';
      throw err;
    }

    if(supVis.track_supervisor === 'present') {
      // Only a change into 'present' is gated, as in the real model.
      const [stored] = await model.read(current, ['track_supervisor']);

      if (stored && stored.track_supervisor !== 'present') {
        await assertRangeOfficerPresent(
          current.scheduled_range_supervision_id,
          current.track_id
        );
      }
    }

    const i = trackSupervisions.findIndex(trackSupervision => {
      return trackSupervision.scheduled_range_supervision_id == current.scheduled_range_supervision_id &&
      trackSupervision.track_id == current.track_id;
    });

    trackSupervisions[i] = {...trackSupervisions[i], ...supVis};
  },

  delete: async function deleteSupervision(supVis) {
    trackSupervisions = trackSupervisions.filter((trackSupervision) => {
      trackSupervision.scheduled_range_supervision_id != supVis.scheduled_range_supervision_id &&
      trackSupervision.track_id != supVis.track_id;
    });
  },

  clear: async function clear() {
    trackSupervisions = [];
    ruleTracks = {};
    ruleRangeSupervisions = {};
  },

  setTrack: async function setTrack(track) {
    ruleTracks[track.id] = track;
  },

  setRangeSupervision: async function setRangeSupervision(rangeSupervision) {
    ruleRangeSupervisions[rangeSupervision.scheduled_range_supervision_id] = rangeSupervision;
  }
};

module.exports = model;
