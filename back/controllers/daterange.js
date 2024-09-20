const path = require('path');
const root = path.join(__dirname, '..');
const config = require(path.join(root, 'config'));
const _ = require('lodash');
const moment = require('moment');

const controller = {
  read: async function read(request, response) {
    let queryResult = response.locals.queryResult;

    if (queryResult.length === 0) {
      return response.status(404).send({
        error: 'Fatal error',
      });
    }

    // Needs this crap adapter for now
    let fieldModifiedQR = [];

    queryResult.forEach((instance) => {
      const index = fieldModifiedQR.findIndex((existing) => {
        return moment(instance['date']).isSame(moment(existing['date']));
      });

      if (index === -1) {
        fieldModifiedQR.push(
          _.pick(
            instance,
            'available',
            'close',
            'date',
            'open',
            'range_supervisor',
            'association_id',
            'range_reservation_id',
            'scheduled_range_supervision_id',
            'arriving_at'
          )
        );
        fieldModifiedQR[fieldModifiedQR.length - 1]['tracks'] = [
          {
            description: instance['description'],
            id: instance['track_id'],
            name: instance['name'],
            notice: instance['notice'],
            short_description: instance['short_description'],
            trackSupervision: instance['track_supervisor'],
            scheduled: {
              visitors: instance['visitors'],
              notice: instance['notice'],
              scheduled_range_supervision_id: instance['scheduled_range_supervision_id'],
              arriving_at: instance['arriving_at'],
              track_id: instance['track_id'],
              track_supervisor: instance['track_supervisor'],
              updated_at: instance['updated_at'],
            },
          },
        ];
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
          visitors: instance['visitors'],
          notice: instance['notice'],
          scheduled_range_supervision_id: instance['scheduled_range_supervision_id'],
          arriving_at: instance['arriving_at'],
          track_id: instance['track_id'],
          track_supervisor: !instance['track_supervisor'] ? 'absent' : instance['track_supervisor'],
          updated_at: instance['updated_at'],
        },
      });
    });

    let finalQR = [];

    fieldModifiedQR.forEach((day, i) => {
      finalQR[i] = {
        available: day['available'],
        close: day['close'],
        date: moment(day['date']).format('YYYY-MM-DD'),
        open: day['open'],
        rangeId: config.development.range_id,
        rangeSupervision: !day['available']
          ? 'closed'
          : !day['range_supervisor']
          ? 'absent'
          : day['range_supervisor'],
        rangeSupervisionScheduled: !!day['range_supervisor'],
        rangeSupervisorId: day['association_id'],
        reservationId: day['range_reservation_id'],
        scheduleId: day['scheduled_range_supervision_id'],
        arriving_at: day['arriving_at'],
        tracks: day['tracks'],
      };
    });

    finalQR.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      }
      return 1;
    });

    return response.status(200).send(finalQR);
  },
};

module.exports = controller;
