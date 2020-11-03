exports.up = function(knex) {
  return knex.schema.alterTable('track_supervision', supervision => {
    supervision.dropForeign('scheduled_range_supervision_id');
    supervision.foreign('scheduled_range_supervision_id')
      .references('id')
      .inTable('scheduled_range_supervision')
      .onDelete('cascade');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('track_supervision', supervision => {
    supervision.dropForeign('scheduled_range_supervision_id');
    supervision.foreign('scheduled_range_supervision_id')
      .references('id')
      .inTable('scheduled_range_supervision');
  });
};
