// What the #477 lane capacity trigger (enforce_section_lane_capacity) says
// when a reservation would use more lanes than a section has free:
// "Reservation of N lane(s) on section S on DATE overlaps reservations
// already using U of the section's T lane(s)".
const LANE_CONFLICT =
  /on section (\d+) on (\S+) overlaps reservations already using (\d+) of the section's (\d+) lane/;

/**
 * Read a lane conflict from a database error.
 *
 * @param {Error} error - An error from a reservation write
 * @return {object|null} { track_section_id, date, free, total }, or null if
 *   the error is something else
 */
function laneConflict(error) {
  const match = error && error.code === 'P0001' && LANE_CONFLICT.exec(error.message);
  if (!match) return null;
  const [, section, date, used, total] = match;
  return {
    track_section_id: Number(section),
    date,
    free: Math.max(0, Number(total) - Number(used)),
    total: Number(total)
  };
}

module.exports = laneConflict;
