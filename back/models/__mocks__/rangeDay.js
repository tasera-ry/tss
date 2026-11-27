/* eslint-env jest */
// Records the writes asked for; the next write answers with `nextDays`, else
// one unchanged day per date.
let writes = [];
let nextDays = null;

module.exports = {
  writeDays: async function writeDays(write) {
    writes.push(write);
    const days = nextDays ?? write.dates.map((date, i) => ({
      date, scheduleId: i + 1, from: null, to: null, changed: false, assigned: false,
    }));
    nextDays = null;
    return days;
  },

  /** The writes asked for, oldest first. */
  writes: () => writes,

  /** Make the next write report these days. */
  answerNextWrite: days => { nextDays = days; },

  clear: () => { writes = []; nextDays = null; },
};
