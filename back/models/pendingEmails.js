const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  read: async function getPending() {
    return await knex
      .select(
        'pending_emails.user_id',
        'user.email',
        'pending_emails.message_type',
        'pending_emails.schedule_id',
        'range_reservation.date'
      )
      .from('pending_emails')
      .innerJoin('user', 'pending_emails.user_id', 'user.id')
      // The date of the shift, if the shift still exists
      .leftJoin('scheduled_range_supervision', 'pending_emails.schedule_id', 'scheduled_range_supervision.id')
      .leftJoin('range_reservation', 'scheduled_range_supervision.range_reservation_id', 'range_reservation.id');
  },
  clear: async function clearPending() {
    return await knex('pending_emails').truncate();
  },
  add: async function queueEmail(message, key, scheduleId) {
    await knex('pending_emails').del().where({ schedule_id: scheduleId });
    await knex('pending_emails').insert({ user_id: key, message_type: message, schedule_id: scheduleId });
  }
};

module.exports = model;
