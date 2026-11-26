const models = require('../models/defaultHours');

const service = {
  read: async function readDefaultHours() {
    return await models.read();
  },

  upsert: async function upsertDefaultHours(data) {
    return await models.upsert(data);
  },
};

module.exports = service;

