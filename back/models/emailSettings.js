const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));

const model = {
  /**
   * Gets all the email-related settings from the database.
   * This does NOT return the data in the format that the front-end and mailer uses.
   * @return {Promise<object[]>} A promise that resolves to an array with the settings
   */
  read: async function readEmailSettings() {
    return knex('settings').where({ setting_name: 'email_sender' })
      .orWhere({ setting_name: 'email_user' })
      .orWhere({ setting_name: 'email_pass' })
      .orWhere({ setting_name: 'email_host' })
      .orWhere({ setting_name: 'email_port' })
      .orWhere({ setting_name: 'email_secure' })
      .orWhere({ setting_name: 'email_shouldsend' })
      .orWhere({ setting_name: 'email_assigned_msg' })
      .orWhere({ setting_name: 'email_update_msg' })
      .orWhere({ setting_name: 'email_cc' })
      .orWhere({ setting_name: 'email_reminder_msg' })
      .orWhere({ setting_name: 'email_decline_msg' })
      .orWhere({ setting_name: 'email_feedback_msg' })
      .orWhere({ setting_name: 'email_resetpass_msg' })
      .orWhere({ setting_name: 'email_collage_msg' })
      .orWhere({ setting_name: 'email_shouldqueue' })
      .orWhere({ setting_name: 'email_sendpending_time' })
      .select('setting_value');
  },
  /**
   * Updates all the email-related settings in the database.
   * The parameter JSON object should be in the following form:
   * emailSettings = {
   *    sender: *Sender email address here*,
   *    user: *SMTP user here*,
   *    pass: *SMTP password here*,
   *    host: *SMTP host address here*,
   *    port: *SMTP port here*,
   *    cc: *CC email address here*,
   *    secure: *Whether or not to use SSL here*,
   *    shouldSend: *Whether or not to automatically send emails here*
   *    assignedMsg: *New supervisor assignment email message*
   *    updateMsg: *Updated supervisor assignment email message*
   *    reminderMsg: *Reminder email message*
   *    declineMsg: *Supervisor declined email message*
   *    feedbackMsg: *Feedback given email message*
   *  };
   * @param {object} newSettings - A JSON object with the email settings in the format that the mailer uses.
   */
  update: async function updateEmailSettings(newSettings) {
    return knex.transaction(async trx => {
      await trx('settings').where({ setting_name: 'email_sender' }).upsert({ setting_value: { sender: newSettings.sender } });
      await trx('settings').where({ setting_name: 'email_user' }).upsert({ setting_value: { user: newSettings.user }});
      await trx('settings').where({ setting_name: 'email_pass' }).upsert({ setting_value: { pass: newSettings.pass }});
      await trx('settings').where({ setting_name: 'email_host' }).upsert({ setting_value: { host: newSettings.host }});
      await trx('settings').where({ setting_name: 'email_port' }).upsert({ setting_value: { port: newSettings.port }});
      await trx('settings').where({ setting_name: 'email_cc' }).upsert({ setting_value: { cc: newSettings.cc }});
      await trx('settings').where({ setting_name: 'email_secure' }).upsert({ setting_value: { secure: newSettings.secure }});
      await trx('settings').where({ setting_name: 'email_shouldsend' }).upsert({ setting_value: { shouldSend: newSettings.shouldSend }});
      await trx('settings').where({ setting_name: 'email_shouldqueue' }).upsert({ setting_value: { shouldQueue: newSettings.shouldQueue }});
      await trx('settings').where({ setting_name: 'email_assigned_msg' }).upsert({ setting_value: { assignedMsg: newSettings.assignedMsg }});
      await trx('settings').where({ setting_name: 'email_update_msg' }).upsert({ setting_value: { updateMsg: newSettings.updateMsg }});
      await trx('settings').where({ setting_name: 'email_reminder_msg' }).upsert({ setting_value: { reminderMsg: newSettings.reminderMsg }});
      await trx('settings').where({ setting_name: 'email_decline_msg' }).upsert({ setting_value: { declineMsg: newSettings.declineMsg }});
      await trx('settings').where({ setting_name: 'email_feedback_msg' }).upsert({ setting_value: { feedbackMsg: newSettings.feedbackMsg }});
      await trx('settings').where({ setting_name: 'email_resetpass_msg' }).upsert({ setting_value: { resetpassMsg: newSettings.resetpassMsg }});
      await trx('settings').where({ setting_name: 'email_collage_msg' }).upsert({ setting_value: { collageMsg: newSettings.collageMsg }});
      await trx('settings').where({ setting_name: 'email_sendpending_time' }).upsert({ setting_value: { sendPendingTime: newSettings.sendPendingTime }});
    });
  }
};

module.exports = model;