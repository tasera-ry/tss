const _ = require('lodash');
const validate = require('validate.js');
const moment = require('moment');

const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Get all the relevant info for the weekview.
   *
   * @param {object} key - The starting day of the week, { begin }
   * @param {object} fields - Attributes about the week to select
   * @return {Promise<object[]>} Days of the week and everything else needed for the weekview
   *
   * @example
   * model.read({ begin: 06-12-2020 })
   */
  read: async function readScheduleWeek(key, fields) {
    let from = moment(key['begin']).format('YYYY-MM-DD');
    let to = moment(key['begin']).add(6, 'days').format('YYYY-MM-DD');
    console.log(from);
    console.log(to);
    /*
      Fields
      available (range_supervision)
      close (scheduled_range_supervision)
      date (whatever date it is)
      open (scheduled_range_supervision)
      rangeId (config.development.range_id)
      rangeSupervision (!available ? 'closed' : rangeSupervisionState)
      rangeSupervisionScheduled (range_supervision)
      rangeSupervisorId (scheduled_range_supervision)
      reservationId (range_supervision)
      scheduleId (scheduled_range_supervision)
      tracks (track)
        ...track,
        ...supervision,
        trackSupervision: supervision ? supervision.track_supervisor : 'absent',
        scheduled: supervision
    */
    let query = knex('range_reservation');

    // a bit messy, need to clean some day
    if(from && to) {
      const dateInterval = knex
        .raw('\
  natural right join\
   (select (generate_series(?, ?, \'1 day\'::interval))::date as date) as iv'
        , [from, to]);
      query = query.joinRaw(dateInterval);
    } else {
      from = '0001-01-01';
      to = '9999-12-31';
    }

    query = query.where(
      (builder) =>
        builder
          .whereBetween('date', [from, to]))

    query.leftJoin('scheduled_range_supervision', 'range_reservation.id', 'scheduled_range_supervision.range_reservation_id')
      .leftJoin('range_supervision', 'scheduled_range_supervision.id', 'range_supervision.scheduled_range_supervision_id')
      .leftJoin('track_supervision', 'scheduled_range_supervision.id', 'track_supervision.scheduled_range_supervision_id')
      .leftJoin('track', 'track_supervision.track_id', 'track.id')

    return query;
  },
};

module.exports = model;
