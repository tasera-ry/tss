const path = require('path')
const root = path.join(__dirname, '..')
const knex = require(path.join(root, 'knex', 'knex'))

/** 
 * Create a new schedule item.
 *
 * @param {object} details - The schedule's details { id, range_reservation_id, supervisor_id, open, close }.
 *
 * @return {Promise<object[]>} The added reservations details.
 *
 * @example
 * createSchedule({ id: 1, range_reservation_id: 10, supervisor_id: 3, open:'18:00', close:'21:00' })
 */
async function createSchedule(details) {
  return knex('scheduled_range_supervision')
    .returning('*')
    .insert(details)
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
  return knex('scheduled_range_supervision')
    .where(key)
    .select(fields)
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
  const ids = (await readSchedule(current, ['id'])).map(obj => obj.id)
  if(ids.length === 0) {
    const err = Error('Didn\'t identify a schedule item to update')
    err.name = 'Unknown schedule'
    throw err
  }

  return knex('scheduled_range_supervision')
    .whereIn('id', ids)
    .update(updates)
    .returning('*')
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
  return knex('scheduled_range_supervision')
    .where(key)
    .del()
}

module.exports = {
  create: createSchedule
  , read: readSchedule
  , update: updateSchedule
  , delete: deleteSchedule
}
