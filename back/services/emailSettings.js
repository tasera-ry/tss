const path = require('path');
const root = path.join(__dirname, '..');
const models = require(path.join(root, 'models'));

const service = {
    read: async function readSettings() {
        const dbArray = await models.emailSettings.read();
        const settings = dbArray.reduce((acc, val) => {
            return Object.assign(acc, val.setting_value);
        }, {});
        return settings;
    },
    update: async function updateSettings(newSettings) {
        return await models.emailSettings.update(newSettings);
    }
};

module.exports = service;