const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  read: async function readMembers(key) {
    let combinedKey = key;

    //id was ambiguous
    if(key.user_id) {
      combinedKey = Object.assign({'track.id': key.track_id}, combinedKey);
      combinedKey = _.omit(combinedKey, ['track_id']);
    }

    return (await models.track.read(_.pick(combinedKey,'track.id', 'track.name', 'description')));
  }
};

module.exports = service;
