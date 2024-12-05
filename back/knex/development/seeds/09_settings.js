
exports.seed = function(knex) {
  /* This JSON object serves as the model for how the front-end expects to eventually receive the data */
  const emailSettings = {
    sender: "noreply@tasera.fi",
    user: "ratavuorot@tasera.fi",
    pass: "mbpw svpd pcgu waey",
    // user: process.env.EMAIL_USER,
    // pass: process.env.EMAIL_PASSWORD,
    host: "smtp.gmail.com",
    port: 465,
    cc: "",
    secure: "true",
    shouldSend: "true",
    shouldQueue: "false",
    sendPendingTime: String(new Date(2024, 1, 1, 21, 17)),
    assignedMsg: '',
    updateMsg: '',
    reminderMsg: 'reminder',
    declineMsg: '',
    feedbackMsg: '',
    resetpassMsg: '',
    collageMsg: ''
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
        { setting_name: 'email_cc', setting_value: { cc: emailSettings.cc }},
        { setting_name: 'email_secure', setting_value: { secure: emailSettings.secure }},
        { setting_name: 'email_shouldsend', setting_value: { shouldSend: emailSettings.shouldSend }},
        { setting_name: 'email_assigned_msg', setting_value: { assignedMsg: emailSettings.assignedMsg }},
        { setting_name: 'email_update_msg', setting_value: { updateMsg: emailSettings.updateMsg }},
        { setting_name: 'email_reminder_msg', setting_value: { reminderMsg: emailSettings.reminderMsg }},
        { setting_name: 'email_decline_msg', setting_value: { declineMsg: emailSettings.declineMsg }},
        { setting_name: 'email_feedback_msg', setting_value: { feedbackMsg: emailSettings.feedbackMsg }},
        { setting_name: 'email_resetpass_msg', setting_value: { resetpassMsg: emailSettings.resetpassMsg }},
        { setting_name: 'email_collage_msg', setting_value: { collageMsg: emailSettings.collageMsg }},
        { setting_name: 'email_shouldqueue', setting_value: { shouldQueue: emailSettings.shouldQueue }},
        { setting_name: 'email_sendpending_time', setting_value: { sendPendingTime: emailSettings.sendPendingTime }}
      ]);
    });
};
