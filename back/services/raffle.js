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
    const dates = await models.reservation.read({ available: true }, [], '2021-01-01', '2021-12-31');
    const len = dates.length;
    const str = dates[0].date
    const day = new Date('str');
    return {"available days in 2021": len};
  }
};

module.exports = service;