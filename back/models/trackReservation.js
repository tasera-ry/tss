const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Get the part-day reservations matching a key, with the name of the
   * association holding each one. Authority use has no association, so its
   * name is null.
   *
   * The date itself is not returned: callers filter by it, and node-postgres
   * turns a date column into a Date at local midnight, which shifts the day
   * when serialised.
   *
   * @param {object} key - Identifying key, { date?, track_section_id? }
   * @return {Promise<object[]>} Reservations that matched the key, by start time
   *
   * @example
   * model.read({ date: '2026-11-14' })
   */
  read: async function readReservation(key) {
    return knex('track_reservation')
      .leftJoin('user', 'user.id', 'track_reservation.association_id')
      .where(key)
      .select(
        'track_reservation.id',
        'track_reservation.track_section_id',
        'track_reservation.association_id',
        'user.name as association_name',
        'track_reservation.type',
        'track_reservation.start_time',
        'track_reservation.end_time',
        'track_reservation.lanes_used',
        'track_reservation.description'
      )
      .orderBy('track_reservation.start_time');
  }
};

module.exports = model;
