const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  create: async function createTrack(info) {
    return (await models.members.create(info)).pop();
  },

  read: async function readMembers(key) {
    let combinedKey = key;

    if(key.user_id) {
      combinedKey = Object.assign({'user_id': key.user_id}, combinedKey);
    }

    return (await models.members.read(_.pick(combinedKey, 'user_id', 'members', 'supervisors', 'name')));
  },
  
  update: async function updateMembers(key, updates) {
    let combinedKey = key;

    //id was ambiguous
    //TODO maybe omit the key thing like earlier years? example from services/track
    if(key.user_id) {
      combinedKey = Object.assign({'user_id': key.user_id}, combinedKey);
    }
    return models.members.update(combinedKey, updates);
  }
};

module.exports = service;
