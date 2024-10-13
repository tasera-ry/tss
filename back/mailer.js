const nodemailer = require('nodemailer');
const services = require('./services');
const schedule = require('node-schedule');

const sendPending = async () => {
  console.log("Kalle: sendPending");

  const emailSettings = await services.emailSettings.read();
  const pending = await services.pendingEmails.read();

  console.log("emailSettings", emailSettings);
  console.log("pending", pending);

  const emailInfo = pending.reduce((acc, val) => {
    if (acc[val.user_id] === undefined)
      acc[val.user_id] = { email: val.email, total: 0, last: null };
    const tmp = (acc[val.user_id])[val.message_type];
    if (tmp === undefined)
      (acc[val.user_id])[val.message_type] = 1;
    else
      (acc[val.user_id])[val.message_type] = tmp + 1;
    acc[val.user_id].total += 1;
    acc[val.user_id].last = val.message_type;
    return acc;
  }, {});
  Object.keys(emailInfo).forEach((outerKey) => {
    const address = emailInfo[outerKey].email;
    const total = emailInfo[outerKey].total;
    const last = emailInfo[outerKey].last;
    if (total > 1) {
      sendEmail(
        getText(
          'collage',
          {
            updateCount: emailInfo[outerKey].update ? emailInfo[outerKey].update.toString() : "0",
            assignedCount: emailInfo[outerKey].assigned ? emailInfo[outerKey].assigned.toString() : "0"
          },
          emailSettings
        ),
        address,
        emailSettings
      );
    } else {
      sendEmail(getText(last, null, emailSettings), address, emailSettings);
    }
  });
  await services.pendingEmails.clear();
};

const getText = (message, opts, emailSettings) => {
  let text = message;
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
      text = emailSettings.resetpassMsg;
      allowedVars['{token}'] = opts.token;
      break;
    case 'collage':
      text = emailSettings.collageMsg;
      allowedVars['{update}'] = opts.updateCount;
      allowedVars['{assigned}'] = opts.assignedCount;
      break;
  }
  // Insert dynamic values into the message
  Object.keys(allowedVars).forEach(token => {
    text = text.replace(new RegExp(token, 'g'), allowedVars[token]);
  });
  return text;
};

const sendEmail = async (text, emailAddress, emailSettings) => {
  console.log("Kalle sendEmail: text", text);
  console.log("Kalle sendEmail: emailAddress", emailAddress);
  console.log("Kalle sendEmail: emailSettings", emailSettings);

  try {
    const subject = 'Tasera';
    let auth = null;
    if (emailSettings.user) {
      auth = {
        user: emailSettings.user,
        pass: emailSettings.pass,
      };
    }

    let transporter = nodemailer.createTransport({
      name: 'tasera.fi',
      host: emailSettings.host,
      port: emailSettings.port,
      secure: emailSettings.secure === 'true',
      auth: auth
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: emailSettings.sender,
      to: emailAddress,
      subject: subject,
      text: text,
    });
    
    console.log('Message sent: %s', info.messageId);

  } catch (error) {
    console.error("SendEmail error:", error);
  }
};

const email = async (message, key, opts) => {
  const emailSettings = await services.emailSettings.read();
  const emailAddress = await services.user.getEmail(key);

  console.log("Kalle: email emailAddress", emailAddress)
  console.log("Kalle: email emailSettings", emailSettings)
  console.log("Kalle: email message", message)
  console.log("Kalle: email key", key)
  console.log("Kalle: email opts", opts)

  if (emailSettings.shouldSend !== 'true') {
    return;
  }
  
  try {

    switch (message) {
      // case 'assigned':
        
      case 'update':
        if (emailSettings.shouldQueue === 'true') {
          services.pendingEmails.add(message, key, opts.scheduleId);
          break;
        }
      default:
        sendEmail(getText(message, opts, emailSettings), emailAddress, emailSettings);
        break;
    }
  } catch (err) {
    console.error("Kalle: Email error", err)
  }
};

const scheduleEmails = (() => {
  const rule = new schedule.RecurrenceRule();
  rule.tz = 'Etc/UTC';
  rule.minute = 0;
  rule.hour = 0;
  const mailJob = schedule.scheduleJob(rule, sendPending);
  return (newTime) => {
    rule.minute = newTime.getUTCMinutes();
    rule.hour = newTime.getUTCHours();
    mailJob.reschedule(rule);
  };
})();

module.exports = { scheduleEmails, email, sendPending };
