
exports.seed = function(knex) {
  /* This JSON object serves as the model for how the front-end expects to eventually receive the data 
   The initial values for the settings are expected to be given as env variables */
  const emailSettings = {
    sender: process.env.SENDER_EMAIL,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    shouldSend: process.env.SHOULD_SEND_EMAIL,
    assignedMsg: '',
    updateMsg: '',
    reminderMsg: '',
    declineMsg: '',
    feedbackMsg: '',
    resetpassMsg: '',
  };

  return knex('settings').del()
    .then(function () {
      // Inserts seed entries
      return knex('settings').insert([
        { setting_name: 'email_sender', setting_value: { sender: emailSettings.sender }},
        { setting_name: 'email_user', setting_value: { user: emailSettings.user }},
        { setting_name: 'email_pass', setting_value: { pass: emailSettings.pass }},
        { setting_name: 'email_host', setting_value: { host: emailSettings.host }},
        { setting_name: 'email_port', setting_value: { port: emailSettings.port }},
        { setting_name: 'email_secure', setting_value: { secure: emailSettings.secure }},
        { setting_name: 'email_shouldsend', setting_value: { shouldSend: emailSettings.shouldSend }},
        { setting_name: 'email_assigned_msg', setting_value: { assignedMsg: emailSettings.assignedMsg }},
        { setting_name: 'email_update_msg', setting_value: { updateMsg: emailSettings.updateMsg }},
        { setting_name: 'email_reminder_msg', setting_value: { reminderMsg: emailSettings.reminderMsg }},
        { setting_name: 'email_decline_msg', setting_value: { declineMsg: emailSettings.declineMsg }},
        { setting_name: 'email_feedback_msg', setting_value: { feedbackMsg: emailSettings.feedbackMsg }},
        { setting_name: 'email_resetpass_msg', setting_value: { resetpassMsg: emailSettings.resetpassMsg }},
      ]);
    });
};
