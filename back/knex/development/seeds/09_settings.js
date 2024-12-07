
exports.seed = function(knex) {
  /* This JSON object serves as the model for how the front-end expects to eventually receive the data */
  const emailSettings = {
    sender: "noreply@tasera.fi",
    user: "ratavuorot@tasera.fi",
    pass: "",
    // user: process.env.EMAIL_USER,
    // pass: process.env.EMAIL_PASSWORD,
    host: "smtp.gmail.com",
    port: 465,
    cc: "",
    secure: "true",
    shouldSend: "true",
    shouldQueue: "false",
    sendPendingTime: String(new Date(2024, 1, 1, 21, 17)),
    collageMsg: '{assigned} - Annettujen vuorojen määrä \n {update} - Muutettujen vuorojen määrä',
    assignedMsg: 'Hei, yhteisöllenne on aikataulutettu uusi(a) päävalvojavuoro(ja). Terveisin Tampereen Seudun Ampumaratayhdistys ry.', 
    updateMsg: 'Hei, teille annettua päävalvojavuoroa on muutettu. Käythän tarkistamassa vuoronne. Terveisin Tampereen Seudun Ampumaratayhdistys ry.',
    reminderMsg: 'Hei, ette ole varmistaneet viikon päästä alkavaa päävalvojavuoroanne. Käykää mahdollisimman pian varmistamassa vuoronne. Terveisin Tampereen Seudun Ampumaratayhdistys ry.',
    declineMsg: 'Valvontavuorosta kieltäydytty Valvoja: {user} Päivämäärä: {date} ', 
    feedbackMsg: 'Palaute vastaanotettu. Valvoja: {user} Palaute: {feedback} ',
    resetpassMsg: 'Olet pyytänyt salasanasi resetointia. Jos olet saanut tämän viestin vahingossa tai jos et ole tilannut salasanan resetointia TSS-sivulta, voit jättää tämän viestin huomiotta. \n Voit resetoida Tasera-salasanasi tästä linkistä: https://tss.tasera.fi/#/renew-password/{token} \n Terveisin, TASERA ry', 
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
