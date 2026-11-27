const { email } = require('../mailer');

/**
 * Tell the associations about their shifts, as the old scheduling page did:
 * a holder (re)assigned the shift is asked to confirm it, the previous holder
 * is told of the change, and a holder whose day changed (opened, closed, new
 * hours) gets an update.
 */
function notify(days) {
  for (const { scheduleId, from, to, changed, assigned } of days) {
    const opts = { scheduleId };
    if (assigned) email('assigned', to, opts).catch(console.error);
    else if (to !== null && changed) email('update', to, opts).catch(console.error);
    if (from !== null && from !== to) email('update', from, opts).catch(console.error);
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
