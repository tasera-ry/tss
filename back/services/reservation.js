const path = require('path');
const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const _ = require('lodash');

/**
 * Create a new reservation.
 *
 * @param {object} reservationDetails - The reservations details { date, available }.
 *
 * @return {Promise<object[]>} The added reservations details.
 *
 * @example
 * createReservation({ date:'2020-01-01', available:true })
 */
async function createReservation(details) {
  console.log("Kalle: createreservation eeeeeee", details)
  details = _.pick(details, 'range_id', 'date', 'available');
  console.log("Kalle: createreservation", details)
  return (await models.reservation.create(details)).pop();
}


/**
 * Get the reservations matching a key.
 *
 * @param {object} key - Identifying key, { id?, range_id?, date?, available? }
 * @param {object} fields - Attributes about the reservation to select { id?, range_id?, date?, available? }
 * @param {string} from - Filter matches starting before date.
 * @param {string} to - Filter matches starting after date.
 * @return {Promise<object[]>} Reservations that matched the key
 *
 * @example
 * readReservation({ available: true }, [], '2020-01-01', '2020-01-31')
 */
async function readReservation(key, fields, from, to) {
  key = _.pick(key, 'id', 'range_id', 'date', 'available');
  return models.reservation.read(key, fields, from, to);
}

/**
 * Update reservations' info.
 *
 * @param {object} current - The current identifying info of the reservation.
 * @param {object} update - New information for the reservation
 *
 * @return {Promise<object[]>} Updated rows
 *
 * @example
 * updateReservation({ date: '2020-01-01' }, { available: false })
 */
async function updateReservation(current, updates) {
  current = _.pick(current, 'id', 'range_id', 'date', 'available');
  updates = _.pick(updates, 'date', 'available');
  return models.reservation.update(current, updates);
}

/**
 * Delete the reservations matching a key.
 *
 * @param {object} key - Identifying key
 * @return {Promise<number>} Count of deleted users
 *
 * @example
 * deleteReservation({ date: '2020-01-01' })
 */
async function deleteReservation(key) {
  key = _.pick(key, 'id', 'range_id', 'date', 'available');
  return models.reservation.delete(key);
}

module.exports = {
  create: createReservation,
  read: readReservation,
  update: updateReservation,
  delete: deleteReservation
};
