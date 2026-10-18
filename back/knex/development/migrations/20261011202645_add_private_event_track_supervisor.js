/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(
    "ALTER TYPE track_supervisor_closed ADD VALUE IF NOT EXISTS 'private_event'"
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // PostgreSQL does not support directly removing enum values.
  // The private_event value remains in the database.
  return Promise.resolve();
};
