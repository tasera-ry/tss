const _ = require('lodash');
const validate = require('validate.js');

let trackSupervisions = []; 

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
    
    if(fields) return _.pick(values, fields);

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
  }
};

module.exports = model;
