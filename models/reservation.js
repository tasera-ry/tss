const path = require('path')
const root = path.join(__dirname, '..')
const knex = require(path.join(root, 'knex', 'knex'))
const _ = require('lodash')

/** 
 * Create a new reservation.
 *
 * @param {object} reservationDetails - The reservations details { id, date, available }.
 *
 * @return {Promise<object[]>} The added reservations details.
 *
 * @example
 * createReservation({ id: 1, date:'2020-01-01', available:true })
 */
async function createReservation(reservationDetails) {
  return knex('range_reservation')
    .returning('*')
    .insert(reservationDetails)
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
  let query = knex('range_reservation')
  
  if(from !== undefined && to !== undefined) {
    const dateInterval = knex
          .raw('\
natural right join\
 (select (generate_series(?, ?, \'1 day\'::interval))::date as date) as iv'
               , [from, to])
    query = query.joinRaw(dateInterval)
  } else {
    from = '0001-01-01'
    to = '9999-12-31'
  }

  query = query.where(
    (builder) =>
      builder
      .where(key)
      .whereBetween('date', [from, to]))

  return query
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
  const ids = (await readReservation(current, ['id'])).map(obj => obj.id)

  if(ids.length === 0) {
    const err = Error('Didn\'t identify reservations to update')
    err.name = 'Unknown reservation'
    throw err
  }
  
  return knex('range_reservation')
    .whereIn('id', ids)
    .update(updates)
    .returning('*')
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
  return knex('range_reservation')
    .where(key)
    .del()
}

module.exports = {
  create: createReservation
  , read: readReservation
  , update: updateReservation
  , delete: deleteReservation
}
