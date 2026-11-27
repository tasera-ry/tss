const { email } = require('../mailer');

/**
 * Tell the associations about their shifts, as the old scheduling page did:
 * a holder (re)assigned the shift is asked to confirm it, the previous holder
 * is told of the change, and a holder whose day changed (opened, closed, new
 * hours) gets an update. One email per association and kind, however many
 * days were saved: `scheduleIds` lists them all (#500 adds their dates).
 */
function notify(days) {
  const shifts = new Map();
  const add = (association, kind, scheduleId) => {
    if (!shifts.has(association)) shifts.set(association, { assigned: [], update: [] });
    shifts.get(association)[kind].push(scheduleId);
  };
  for (const { scheduleId, from, to, changed, assigned } of days) {
    if (assigned) add(to, 'assigned', scheduleId);
    else if (to !== null && changed) add(to, 'update', scheduleId);
    // TODO(#500): 'cancelled' for the previous holder once #500 is merged.
    if (from !== null && from !== to) add(from, 'update', scheduleId);
  }
  for (const [association, kinds] of shifts) {
    for (const kind of ['assigned', 'update']) {
      if (kinds[kind].length > 0) {
        email(kind, association, { scheduleIds: kinds[kind] }).catch(console.error);
      }
    }
  }
}

module.exports = {
  write: async function writeRangeDays(request, response) {
    const days = response.locals.days;
    try {
      notify(days);
    } catch (error) {
      console.error(error);
    }
    return response.status(200).send({ dates: days.map(day => day.date) });
  }
};
