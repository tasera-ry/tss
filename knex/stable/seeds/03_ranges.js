const ranges = [
  {
    name: 'SATLSTO:n ampumarata'
  }
]

exports.seed = function(knex) {
  return knex('range')
    .insert(ranges)
}
