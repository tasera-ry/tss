const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const controller = {
  read: async function readSettings(request, response) {
    const settings = await services.emailSettings.read();
    // The following line prevents the password from being sent out
    settings.pass = '';
    return response.status(200).send(settings);
  },
  update: async function updateSettings(request, response) {
    await services.emailSettings.update(request.body);
    return response.status(200).send();
  }
};

module.exports = controller;