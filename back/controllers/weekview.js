const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config'));
const _ = require('lodash');
const moment = require('moment');

const controller = {
  read: async function read(request, response) {
    let queryResult = response.locals.queryResult

    if(queryResult.length === 0) {
      return response
        .status(404)
        .send({
          error: 'Fatal error'
        });
    }

    // Needs this crap adapter for now
    fieldModifiedQR = [];

    queryResult.forEach((instance, i) => {
      const index = fieldModifiedQR.findIndex((existing) => {
        return moment(instance['date']).isSame(moment(existing['date']));
      });

      if (index === -1) {
        fieldModifiedQR.push(_.pick(instance, 'available', 'close', 'date', 'open', 'range_supervisor', 'supervisor_id', 'range_reservation_id', 'scheduled_range_supervision_id'));
        fieldModifiedQR[fieldModifiedQR.length - 1]['tracks'] = [{
          description: instance['description'],
          id: instance['track_id'],
          name: instance['name'],
          notice: instance['notice'],
          short_description: instance['short_description'],
          trackSupervision: instance['track_supervisor'],
          scheduled: {
            notice: instance['notice'],
            scheduled_range_supervision_id: instance['scheduled_range_supervision_id'],
            track_id: instance['track_id'],
            track_supervisor: instance['track_supervisor'],
            updated_at: instance['updated_at']
          }
        }]
        return;
      }

      fieldModifiedQR[index]['tracks'].push({
        description: instance['description'],
        id: instance['track_id'],
        name: instance['name'],
        notice: instance['notice'],
        short_description: instance['short_description'],
        trackSupervision: instance['track_supervisor'],
        scheduled: {
          notice: instance['notice'],
          scheduled_range_supervision_id: instance['scheduled_range_supervision_id'],
          track_id: instance['track_id'],
          track_supervisor: instance['track_supervisor'],
          updated_at: instance['updated_at']
        }
      })
    });

    finalQR = [];

    fieldModifiedQR.forEach((day, i) => {
      finalQR[i] = {
        available: day['available'],
        close: day['close'],
        date: moment(day['date']).format('YYYY-MM-DD'),
        open: day['open'],
        rangeId: config.development.range_id,
        rangeSupervision: !day['available'] ? 'closed' : day['range_supervisor'],
        rangeSupervisionScheduled: !!day['range_supervisor'],
        rangeSupervisorId: day['supervisor_id'],
        reservationId: day['range_reservation_id'],
        scheduleId: day['scheduled_range_supervision_id'],
        tracks: day['tracks']
      }
    });

    return response
      .status(200)
      .send(finalQR);
  },
};

module.exports = controller;
