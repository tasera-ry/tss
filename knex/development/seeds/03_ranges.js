const _ = require('lodash')
const casual = require('casual')

casual.seed(0)

exports.seed = function(knex) {
  return knex('range')
    .del()
    .then(() => {
      return knex('range')
        .insert(_.times(3, casual._shooting_range))
    })
};

casual.define('shooting_range', function() {
  return {
    name: casual.company_name + ' Shooting Range'
  }
})
