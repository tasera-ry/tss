const path = require('path')
const root = path.join(__dirname, '..', '..', '..')
const config = require(path.join(root, 'config'))

const _ = require('lodash')
const casual = require('casual')
const ora = require('ora')

casual.seed(config.seeds.seed)

exports.seed = async function(knex) {
  const generateRanges = Promise.all(
    _.times(
      config.seeds.ranges
      , casual._shooting_range))

  const generateSpinner = ora.promise(
    generateRanges
    , `Generating ${config.seeds.ranges} ranges`)

  const ranges = await generateRanges

  const insertRanges = Promise.all(
    _.chunk(ranges, config.seeds.chunkSize)
      .map(async (rangeChunk) => knex('range').insert(rangeChunk)))
  console.log('done')

  const insertSpinner = ora.promise(insertRanges, 'Inserting ranges')

  const response = await insertRanges
};

casual.define('shooting_range', async function() {
  return {
    name: casual.company_name + ' Shooting Range'
  }
})
