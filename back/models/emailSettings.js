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
      await trx('settings')
        .insert({ setting_name: 'email_sender', setting_value: { sender: newSettings.sender } })
        .onConflict('setting_name')
        .merge();
      
      await trx('settings')
        .insert({ setting_name: 'email_user', setting_value: { user: newSettings.user } })
        .onConflict('setting_name')
        .merge();
      
      await trx('settings')
        .insert({ setting_name: 'email_pass', setting_value: { pass: newSettings.pass } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_host', setting_value: { host: newSettings.host } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_port', setting_value: { port: newSettings.port } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_cc', setting_value: { cc: newSettings.cc } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_secure', setting_value: { secure: newSettings.secure } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_shouldsend', setting_value: { shouldSend: newSettings.shouldSend } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_shouldqueue', setting_value: { shouldQueue: newSettings.shouldQueue } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_assigned_msg', setting_value: { assignedMsg: newSettings.assignedMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_update_msg', setting_value: { updateMsg: newSettings.updateMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_reminder_msg', setting_value: { reminderMsg: newSettings.reminderMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_decline_msg', setting_value: { declineMsg: newSettings.declineMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_feedback_msg', setting_value: { feedbackMsg: newSettings.feedbackMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_resetpass_msg', setting_value: { resetpassMsg: newSettings.resetpassMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_collage_msg', setting_value: { collageMsg: newSettings.collageMsg } })
        .onConflict('setting_name')
        .merge();
        
      await trx('settings')
        .insert({ setting_name: 'email_sendpending_time', setting_value: { sendPendingTime: newSettings.sendPendingTime } })
        .onConflict('setting_name')
        .merge();
    });
  }
};

module.exports = model;
