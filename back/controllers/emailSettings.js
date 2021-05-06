const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const { sendPending, scheduleEmails } = require('../mailer.js');

const controller = {
  read: async function readSettings(request, response) {
    const settings = await services.emailSettings.read();
    // The following line prevents the password from being sent out
    settings.pass = '';
    return response.status(200).send(settings);
  },
  update: async function updateSettings(request, response) {
    await services.emailSettings.update(request.body);
    scheduleEmails(new Date(request.body.sendPendingTime));
    return response.status(200).send();
  },
  sendPendingEmails: async function sendPendingEmails(request, response) {
    await sendPending();
    return response.status(200).send();
  }
};

module.exports = controller;