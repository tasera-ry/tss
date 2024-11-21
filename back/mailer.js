const nodemailer = require('nodemailer');
const services = require('./services');
const schedule = require('node-schedule');

/**
 * Function sends or queues an email based on the emailsettings.
 * It first retrieves the email settings and the recipient's email address.
 * If the email settings indicate that emails should be sent, it proceeds
 * to send the email using the appropriate content based on the message type.
 *
 * @param {string} message - The type of message to be sent, which determines the email content.
 * @param {string} key - The key used to identify the recipient and retrieve their email address.
 * @param {Object} opts - Additional options that may be used for sending the email.
 * @returns {Promise<void>} - A promise that resolves when the email is successfully sent or if sending is skipped.
 */
const email = async (message, key, opts) => {
  const emailSettings = await services.emailSettings.read();
  const emailAddress = await services.user.getEmail(key);

  // If it has been selected that emails should not be sent, do nothing
  if (emailSettings.shouldSend !== 'true') {
    return;
  }

  switch (message) {
    case 'assigned':
    case 'update':
      // If the emails should queued, add the email to the pending emails
      if (emailSettings.shouldQueue === 'true') {
        services.pendingEmails.add(message, key, opts.scheduleId);
        break;
      }
    // Otherwise, send the email immediately
    default:
      sendEmail(getText(message, opts, emailSettings), emailAddress, emailSettings);
      break;
  }
};

/**
 * Function that sends all pending emails.
 * The function reads email settings and pending emails from the services, then reduces
 * the pending emails to an object containing the user's email, total number of messages,
 * and the last message type. Calls sendEmail that actually sends the email.
 *
 * @returns {Promise<void>} - A promise that resolves when the pending emails have been processed and logged.
 */
const sendPending = async () => {
  try {
    const emailSettings = await services.emailSettings.read();
    const pending = await services.pendingEmails.read();

    if (pending.length === 0) {
      return { success: true, message: 'No messages to send.' };
    }

    // Print pending emails to console
    console.log('Pending emails:', pending);

    const emailInfo = pending.reduce((acc, val) => {
      if (acc[val.user_id] === undefined) {
        acc[val.user_id] = { email: val.email, total: 0, last: null };
      }
      const tmp = (acc[val.user_id])[val.message_type];
      if (tmp === undefined) {
        (acc[val.user_id])[val.message_type] = 1;
      } else {
        (acc[val.user_id])[val.message_type] = tmp + 1;
      }
      acc[val.user_id].total += 1;
      acc[val.user_id].last = val.message_type;
      return acc;
    }, {});

    let errors = [];

    await Promise.all(Object.keys(emailInfo).map(async (outerKey) => {
      const address = emailInfo[outerKey].email;
      const total = emailInfo[outerKey].total;
      const last = emailInfo[outerKey].last;
      let result;
      // If total is greater than 1, it indicates that there are multiple updates or messages
      // for the receiver, and a "collage" email is sent summarizing the updates.
      if (total > 1) {
        result = await sendEmail(
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
        result = await sendEmail(getText(last, null, emailSettings), address, emailSettings);
      }

      // If there was an error in sendEmail
      if (!result.success) {
        errors.push({ email: address, error: result.error });
      }
    }));

    // If there were errors in sendEmail-functions, return them
    if (errors.length > 0) {
      return { success: false, errors: errors };
    }

    await services.pendingEmails.clear();
  } catch (error) {
    console.error('Error in sendPending:', error);
    return { success: false, error: error.message };
  }
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

/**
 * Sends an email with the specified text to the given email address using the provided email settings.
 *
 * @param {string} text - The content of the email to be sent.
 * @param {string} emailAddress - The recipient's email address.
 * @param {Object} emailSettings - The settings for the email service, including host, port, user, and pass.
 * @returns {Promise<void>} - A promise that resolves when the email is successfully sent.
 */
const sendEmail = async (text, emailAddress, emailSettings) => {
  try {
    const subject = 'Tasera';
    let auth;
    if (emailSettings.user) {
      auth = {
        user: emailSettings.user,
        pass: emailSettings.pass,
      };
    } else {
      auth = null;
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
    console.log('Message sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return { success: false, error: error.message };
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


/**
 * Check whether email and password match when sending SMTP
 * @param emailSettings 
 * @param cb callback function that is called after credentials are verified with parameters (error, success)
 */
const verifyEmailCredentials = async (emailSettings, cb) => {
  try {
    const transporter = nodemailer.createTransport({
      name: 'tasera.fi',
      host: emailSettings.host,
      port: emailSettings.port,
      secure: emailSettings.secure === 'true',
      auth: {
        user: emailSettings.user,
        pass: emailSettings.pass,
      }
    });

    transporter.verify(cb);

  } catch (error) {
    console.error("verifyEmailCredentials error:", error);
    // Return a structured error with relevant details to the controller
    throw {
      message: error.message,
      code: error.code,
      errno: error.errno,
      port: error.port,
    };
  }
}

/**
 * Schedule sending email to association if they have not confirmed their track supervision
 */
async function scheduleEmailReminder() {
  try {
    const emailSettings = await services.emailSettings.read();
    if( !emailSettings || !emailSettings.sendPendingTime ) {
      console.error("scheduleEmailReminder cannot read emailSettings sendPendingTime!", emailSettings)
      return
    }
    const sendTime = new Date(emailSettings.sendPendingTime)
    sendTime.setHours(sendTime.getHours() + 2)
    const hour = sendTime.getHours().toString().padStart(2, '0');
    const minute = sendTime.getMinutes().toString().padStart(2, '0');
    console.log("scheduleEmailReminder: hour", hour)
    console.log("scheduleEmailReminder: minute", minute)
    //Runs the checker everyday and checks if officer has confirmed 7 days from today
    //Stars of the scheduler explained below:
    //'seconds', 'minutes', 'hour', 'day of month', 'month', 'day of week'
    //For test purposes, you can replace the function declaration with this. It runs the code every 4 seconds.
    // schedule.scheduleJob('*/4 * * * * *', async function(){
    schedule.scheduleJob(`00 ${minute} ${hour} * * 0-6`, async function () {
      //make date object 7 days from this day.
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      //function that returns the association of 7 days into the future.
      async function getFutureSupervision() {
        return await knex
          .from('user')
          .leftJoin('association', 'user.id', 'association.user_id')
          .leftJoin('scheduled_range_supervision', 'association.user_id', 'scheduled_range_supervision.association_id')
          .leftJoin('range_supervision', 'scheduled_range_supervision.id', 'range_supervision.scheduled_range_supervision_id')
          .leftJoin('range_reservation', 'scheduled_range_supervision.range_reservation_id', 'range_reservation.id')
          .where('range_reservation.date', '=', currentDate)
          .select('scheduled_range_supervision.association_id', 'range_supervisor');
      }
      try {
        const receiver = await getFutureSupervision();
        //first we check if the supervisor has confirmed or not.
        //if status = not cnofirmed, fetches email with supervisor id and sends it to mailer.js 
        if (receiver[0] != undefined && receiver[0].range_supervisor === 'not confirmed') {
          email('reminder', receiver[0].association_id, null);
        }
      } catch (error) {
        console.error(error);
      }
    });
  } catch (err) {
    console.error(err)
  }
}
scheduleEmailReminder();


module.exports = { scheduleEmails, email, sendPending, verifyEmailCredentials, scheduleEmailReminder };
