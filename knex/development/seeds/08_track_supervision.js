const casual = require('casual')
const _ = require('lodash')

const path = require('path')
const root = path.join(__dirname, '..', '..', '..')
const config = require(path.join(root, 'config'))
const ora = require('ora')

casual.seed(config.seeds.seed)

exports.seed = async function(knex) {
  const schedule = (
    await knex('track')
      .join('range', 'range.id', 'track.range_id')
      .join('range_reservation', 'range_reservation.range_id', 'range.id')
      .join('scheduled_range_supervision'
            , 'scheduled_range_supervision.range_reservation_id'
            , 'range_reservation.id')
      .column({
        trackId: 'track.id'
        , supervisionId: 'scheduled_range_supervision.id'
      })
      .whereNotNull('scheduled_range_supervision.supervisor_id'))

  const generateSupervisions = Promise.all(
    schedule.map(({trackId, supervisionId}) => (
      casual.track_supervision(trackId, supervisionId))))

  const generateSpinner = ora.promise(
    generateSupervisions
    , `Generating ${schedule.length} track supervisions`)

  const supervisions = await generateSupervisions

  const insertSupervisions = Promise.all(
    _.chunk(supervisions, config.seeds.chunkSize)
      .map(async (supervisionChunk) => (
        await knex('track_supervision')
          .insert(supervisionChunk))))

  const insertSpinner = ora.promise(
    insertSupervisions
    , 'Inserting track supervisions')

  const response = await insertSupervisions
}

casual.define('track_supervision', async (trackId, supervisionId) => {
  const state = ['absent', 'present', 'closed']
  return {
    scheduled_range_supervision_id: supervisionId
    , track_id: trackId
    , track_supervisor: state[casual.integer(0, state.length - 1)]
    , notice: casual.description.substring(0, 255)
  }
})
