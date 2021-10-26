const path = require('path');

const root = path.join(__dirname, '..');

const service = {
  read: async function readMembers(key) {
    return (await models.members.read(_.pick(key, 'members', 'supervisors')))
      .map(_.partialRight(_.omit));
  },
};

module.exports = service;
