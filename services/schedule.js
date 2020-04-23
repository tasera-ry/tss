const path = require('path')
const root = path.join(__dirname, '..')
const models = require(path.join(root, 'models'))
const _ = require('lodash')
const moment = require('moment')

/** 
 * Create a new schedule item.
 *
 * @param {object} details - The schedule's details { range_reservation_id, supervisor_id?, open, close }.
 *
 * @return {Promise<object[]>} The added reservations details.
 *
 * @example
 * createSchedule({ range_reservation_id: 10, supervisor_id: 3, open:'18:00', close:'21:00' })
 */
async function createSchedule(details) {
  details = _.pick(details, 'range_reservation_id', 'supervisor_id', 'open', 'close')
  return (await models.schedule.create(details)).pop()
}

/**
 * Get the schedule items matching a key.
 *
 * @param {object} key - Identifying key, { id?, range_reservation_id?, supervisor_id?, open?, close? }
 * @param {object} fields - Attributes about the schedule to select { id?, range_reservation_id?, supervisor_id?, open?, close? }
 * @return {Promise<object[]>} Schedule items that matched the key
 *
 * @example
 * readSchedule({ open:'18:00:00' }, [])
 */
async function readSchedule(key, fields) {
  return models.schedule.read(key, fields)
}

/**
 * Update schedules' info.
 *
 * @param {object} current - The current identifying info of the schedule
 * @param {object} update - New information for the schedule
 *
 * @return {Promise<object[]>} Updated rows
 *
 * @example
 * updateSchedule({ time: '17:00:00' }, { open: '18:00:00' })
 */
async function updateSchedule(current, updates) {
  updates = _.pick(updates, 'range_reservation_id', 'supervisor_id', 'open', 'close')
  return models.schedule.update(current, updates)
}

/**
 * Delete the schedule items matching a key.
 *
 * @param {object} key - Identifying key
 * @return {Promise<number>} Count of deleted users
 *
 * @example
 * deleteSchedule({ id: 1 })
 */
async function deleteSchedule(key) {
  return models.schedule.delete(key)
}

module.exports = {
  create: createSchedule
  , read: readSchedule
  , update: updateSchedule
  , delete: deleteSchedule
}
