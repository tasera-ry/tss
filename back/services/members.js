const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  read: async function readMembers(key) {

    return (await models.members.read(_.pick(key, 'members', 'supervisors')));
  }

};

module.exports = service;
