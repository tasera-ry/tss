
exports.seed = function(knex) {
  // Deletes ALL existing entries
  const emailSettings = {
    sender: process.env.SENDER_EMAIL,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    shouldSend: process.env.SHOULD_SEND_EMAIL
  };

  return knex('settings').del()
    .then(function () {
      // Inserts seed entries
      return knex('settings').insert([
        { setting_name: "email_sender", setting_value: { sender: emailSettings.sender }},
        { setting_name: "email_user", setting_value: { user: emailSettings.user }},
        { setting_name: "email_pass", setting_value: { pass: emailSettings.pass }},
        { setting_name: "email_host", setting_value: { host: emailSettings.host }},
        { setting_name: "email_port", setting_value: { port: emailSettings.port }},
        { setting_name: "email_secure", setting_value: { secure: emailSettings.secure }},
        { setting_name: "email_shouldsend", setting_value: { shouldSend: emailSettings.shouldSend }}
      ]);
    });
};
