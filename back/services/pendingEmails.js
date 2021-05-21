const path = require('path');
const model = require('../models/pendingEmails');
const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const service = {
  read: async function getPending() {
    return await models.pendingEmails.read();
  },
  clear: async function clearPending() {
    return await models.pendingEmails.clear();
  },
  add: async function queueEmail(message, key, scheduleId) {
    return await models.pendingEmails.add(message, key, scheduleId);
  }
};

module.exports = service;
