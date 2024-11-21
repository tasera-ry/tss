const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const { sendPending, scheduleEmails, verifyEmailCredentials, scheduleEmailReminder } = require('../mailer.js');

const controller = {
  read: async function readSettings(request, response) {
    const settings = await services.emailSettings.read();
    return response.status(200).send(settings);
  },
  update: async function updateSettings(request, response) {
    // callback for verifyEmailCredentials
    const updateEmailSettings = async (error, success) => {
      if (error) {
        console.error("updateEmailSettings error:", error)
        return response.status(500).send({success: false, ...error})
      } else if (success) { 
        await services.emailSettings.update(request.body);
        scheduleEmails(new Date(request.body.sendPendingTime));
        scheduleEmailReminder();
        return response.status(200).send();
      }
    }
    verifyEmailCredentials(request.body, updateEmailSettings);
  },
  sendPendingEmails: async function sendPendingEmails(request, response) {
    const result = await sendPending();
    if (!result.success) {
      console.error("sendPendingEmails error:", error);
      return response.status(500).send({ success: false, error: error.message });
    } else if (result.success && result.message) {
      return response.status(200).send({ success: true, message: result.message });
    } else {
      return response.status(200).send({ success: true });
    }
  }
};

module.exports = controller;