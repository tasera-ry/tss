const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  read: async function readMembers(key) {
    let combinedKey = key;

    if(key.user_id) {
      combinedKey = Object.assign({'user_id': key.user_id}, combinedKey);
    }
    else {
      combinedKey = _.omit(combinedKey, ['user_id']);
    }

    return (await models.members.read(_.pick(combinedKey, 'user_id', 'members', 'supervisors')));
  }
};

module.exports = service;
