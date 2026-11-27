/**
 * The range officer's status after an admin saves the range's day (#463).
 *
 * The admin chooses only the association; the status follows: a new holder
 * starts unconfirmed, no holder is absent, and the same holder keeps what the
 * association confirmed or the tablet marked. Closing the range is stored on
 * range_reservation alone, so the officer's status survives a closed day.
 *
 * @param {object|undefined} current - The day's range_supervision row, if any
 * @param {number|null} from - The association holding the shift before
 * @param {number|null} to - The association chosen
 * @return {object|null} Columns to write, or null when nothing changes
 */
module.exports = function nextRangeSupervision(current, from, to) {
  const reset = { arriving_at: null, rangeofficer_id: null };
  if (to === null) {
    if (!current || current.range_supervisor === 'absent') return null;
    return { range_supervisor: 'absent', ...reset };
  }
  if (to !== from || !current || current.range_supervisor === 'absent') {
    return { range_supervisor: 'not confirmed', ...reset };
  }
  return null;
};
