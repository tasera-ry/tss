exports.up = function(knex) {
  return knex.schema.alterTable('scheduled_range_supervision', supervision => {
    supervision.dropForeign('supervisor_id')
    supervision.foreign('supervisor_id')
      .references('user_id')
      .inTable('supervisor')
      .onDelete('set null')
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('scheduled_range_supervision', supervision => {
    supervision.dropForeign('supervisor_id')
    supervision.foreign('supervisor_id')
      .references('user_id')
      .inTable('supervisor')
  })
}
