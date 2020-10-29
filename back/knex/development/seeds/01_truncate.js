const _ = require('lodash')
const ora = require('ora')

exports.seed = async function(knex) {
  const truncate =  async(table) => {
    const promise = knex(table).del()
    ora.promise(promise, `Truncate ${table}`)
    return await promise
  }
  await truncate('track_supervision_history')
  await truncate('track_supervision')
  await truncate('range_supervision')
  await truncate('scheduled_range_supervision')
  await truncate('range_reservation')
  await truncate('track')
  await truncate('range')
  await truncate('supervisor')
  await truncate('user')
}
