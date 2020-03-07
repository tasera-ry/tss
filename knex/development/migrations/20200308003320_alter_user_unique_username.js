exports.up = function(knex) {
  return knex.schema.alterTable('user', user => {
    user.unique('name')
  })
};

exports.down = function(knex) {
  
};
