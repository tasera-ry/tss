const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));
const moment = require('moment');

const _ = require('lodash');

const service = {
  /**
   * Get all relevant info about a week.
   *
   * @param {object} key - The query information. 'begin' is the first day of the week.
   *
   * @return {Promise<object[]>} The info about the next seven days for weekview
   *
   * @example
   * exports.read({ begin: '06-12-2020' }) - The days from 06-12-2020 to 12-12-2020
   */
  readWeek: async function readScheduleWeek(key) {
    let daterange = _.pick(key, 'begin');
    daterange['end'] = moment(key['begin']).add(6, 'days').format('YYYY-MM-DD');
    return await models.daterange.read(daterange);
  },

  /**
   * Get all relevant info about a range of dates.
   *
   * @param {object} key - The query information. 'begin' is the first day, 'end' is the last.
   *
   * @return {Promise<object[]>} The info about the date range
   *
   * @example
   * exports.read({ begin: '06-12-2020', end: '07-02-2021' }) - The days from 06-12-2020 to 07-02-2021
   */
  readFreeform: async function readFreeform(key) {
    return await models.daterange.read(_.pick(key, 'begin', 'end'));
  },
};

module.exports = service;
