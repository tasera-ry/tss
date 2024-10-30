const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const { sendPending, scheduleEmails, verifyEmailCredentials } = require('../mailer.js');

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
        return response.status(400).send("Wrong credentials")
      } else if (success) { 
        await services.emailSettings.update(request.body);
        scheduleEmails(new Date(request.body.sendPendingTime));
        return response.status(200).send();
      }
    }
    verifyEmailCredentials(request.body, updateEmailSettings);
  },
  sendPendingEmails: async function sendPendingEmails(request, response) {
    try {
      await sendPending();
      return response.status(200).send({success: true});
    } catch (error) {
      console.error("sendPendingEmails error:", error);
      return response.status(500).send({success: false, error});
    }
  }
};

module.exports = controller;