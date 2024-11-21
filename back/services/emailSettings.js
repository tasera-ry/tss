const path = require('path');
const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const service = {
  /**
   * Gets the email-related settings from the database and transforms the data into the format expected by the front-end and mailer
   * @returns {object} An object with the email settings from the database
   */
  read: async function readSettings() {
    const dbArray = await models.emailSettings.read();
    const settings = dbArray.reduce((acc, val) => {
      return Object.assign(acc, val.setting_value);
    }, {});
    return settings;
  },
  /**
   * Updates all the email-related settings in the database with the exception of the password which may not be given, in which case it will remain unchanged.
   * The parameter JSON object should be in the following form:
   * emailSettings = {
   *    sender: *Sender email address here*,
   *    user: *SMTP user here*,
   *    pass: *SMTP password here*,
   *    host: *SMTP host address here*,
   *    port: *SMTP port here*,
   *    cc: *CC email address here*,
   *    secure: *Whether or not to use SSL here*,
   *    shouldSend: *Whether or not to automatically send emails here*
   *  };
   * @param {object} newSettings - A JSON object with the email settings in the format that the mailer uses.
   */
  update: async function updateSettings(newSettings) {
    return await models.emailSettings.update(newSettings);
  }
};

module.exports = service;