const _ = require('lodash')
const casual = require('casual')

casual.seed(0)

exports.seed = function(knex) {
  const ranges = _.times(1, casual._shooting_range)

  return knex('range')
    .insert(ranges)
};

casual.define('shooting_range', function() {
  return {
    name: casual.company_name + ' Shooting Range'
  }
})
