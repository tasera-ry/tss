const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

const service = {
  /**
   * 
   * @param {*} info 
   * @returns 
   */
  create: async function createRaffle(info) {
    const dates = await models.reservation.read({ available: true }, [], '2021-07-01', '2021-12-31')
    return dates;
  }
};

module.exports = service;