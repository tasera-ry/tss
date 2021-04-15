const nodemailer = require('nodemailer');
const services = require('./services');

const sendEmail = async function(message, emailAddress, opts) {
  const emailSettings = await services.emailSettings.read();

  if (emailSettings.shouldSend !== 'true') {
    return;
  }

  
    const toMail = emailAddress;
    const subject = 'Tasera info';
    //defaults message to command if for some reason fails in switch
    let text = message;
    let auth;
    if (typeof emailSettings.user !== 'undefined'){
      auth = {
        user: emailSettings.user,
        pass: emailSettings.pass,
      };
    }
    else{
      auth = null;
    }

    let allowedVars = {};

    switch (message) {
    case 'assigned':
      text = emailSettings.assignedMsg;
      break;
    case 'update':
      text = emailSettings.updateMsg;
      break;
    case 'reminder':
      text = emailSettings.reminderMsg;
      break;
    case 'decline':
      text = emailSettings.declineMsg;
      allowedVars['{date}'] = opts.date;
      allowedVars['{user}'] = opts.user;
      break;
    case 'feedback':
      text = emailSettings.feedbackMsg;
      allowedVars['{feedback}'] = opts.feedback;
      allowedVars['{user}'] = opts.user;
      break;
    case 'password_reset':
      text = 'Hei, olette pyytäneet salasanan palauttamista. Painamalla alla olevaa linkkiä (tai kopioimalla sen osoiteriville) pääsette asettamaan uuden salasanan.\n\n'
        + 'http://localhost:3000/#/renew-password/' + opts.token + '\n\n'
        + 'Mikäli ette ole pyytäneet salasanan palauttamista itse, voitte sivuuttaa tämän sähköpostin.\n\nTerveisin TASERA ry';
    }
    // Insert dynamic values into the message
    Object.keys(allowedVars).forEach(token => {
      text = text.replace(new RegExp(token, 'g'), allowedVars[token]);
    });

    let transporter = nodemailer.createTransport({
      host: emailSettings.host,
      port: emailSettings.port,
      secure: emailSettings.secure === 'true',
      auth: auth,
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: emailSettings.sender,
      to: toMail,
      subject: subject,
      text: text,
    });
    
    console.log('Message sent: %s', info.messageId);

  


};
module.exports = { sendEmail };
