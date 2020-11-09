const path = require('path');

const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));
const config = require(path.join(root, 'config', 'config'));

const validate = require('validate.js');
const _ = require('lodash');

const service = {
  /**
   * Get all relevant info about a week.
   *
   * @param {object} key - The query information. 'begin' is the first day of the week.
   * @param {string[]} fields - Filter wanted properties from week
   *
   * @return {Promise<object[]>} The info about the next seven days for weekview
   *
   * @example
   * exports.read({ begin: '06-12-2020' }) - The days from 06-12-2020 to 12-12-2020
   */
  read: async function readScheduleWeek(key, fields) {
    return await models.weekview.read(_.pick(key, 'begin'))
  },
};

module.exports = service;
