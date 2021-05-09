const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  read: async function getPending() {
    return await knex.select('user_id', 'email', 'message_type')
      .from('pending_emails')
      .innerJoin('user', 'pending_emails.user_id', 'user.id');
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
