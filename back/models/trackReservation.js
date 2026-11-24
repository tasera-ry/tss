const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

// The stored columns, with the date as text: node-postgres turns a date column
// into a Date at local midnight, which shifts the day when serialised. Built
// per query, not at load: the tests' knex mock has no raw().
function rowColumns() {
  return [
    'id',
    'track_section_id',
    'association_id',
    'type',
    knex.raw('to_char(date, \'YYYY-MM-DD\') as date'),
    'start_time',
    'end_time',
    'lanes_used',
    'description'
  ];
}

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
  },

  /**
   * Get stored rows as they are, date included, for writes to check against.
   *
   * @param {object} key - Column values to match
   * @return {Promise<object[]>} Matching rows, date as YYYY-MM-DD
   */
  readRows: async function readRows(key) {
    return knex('track_reservation').where(key).select(rowColumns()).orderBy('id');
  },

  /**
   * Insert reservations in one statement, so either all are stored or none.
   * The lane capacity trigger rejects any that would overcommit a section.
   *
   * @param {object[]} rows - Reservations to store
   * @return {Promise<object[]>} The stored rows
   */
  create: async function createReservations(rows) {
    return knex('track_reservation').insert(rows).returning(rowColumns());
  },

  /**
   * Apply the same changes to the given reservations in one statement.
   *
   * @param {number[]} ids - Reservations to change
   * @param {object} changes - Column values to set
   * @return {Promise<object[]>} The changed rows
   */
  update: async function updateReservations(ids, changes) {
    return knex('track_reservation')
      .whereIn('id', ids)
      .update(changes)
      .returning(rowColumns());
  },

  /**
   * Delete the given reservations in one statement.
   *
   * @param {number[]} ids - Reservations to delete
   * @return {Promise<number>} How many were deleted
   */
  delete: async function deleteReservations(ids) {
    return knex('track_reservation').whereIn('id', ids).del();
  }
};

module.exports = model;
