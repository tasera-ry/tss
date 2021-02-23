const path = require('path');
const root = path.join(__dirname, '..');
const knex = require(path.join(root, 'knex', 'knex'));


const model = {
    read: async function readEmailSettings() {
        //return knex("settings").where({"settings_type": "email_settings"}).first().select("json_settings");
        return knex("settings").where({ setting_name: "email_sender" })
            .orWhere({ setting_name: "email_user" })
            .orWhere({ setting_name: "email_pass" })
            .orWhere({ setting_name: "email_host" })
            .orWhere({ setting_name: "email_port" })
            .orWhere({ setting_name: "email_secure" })
            .orWhere({ setting_name: "email_shouldsend" })
            .select("setting_value");
    },
    update: async function updateEmailSettings(newSettings) {
        return knex.transaction(async trx => {
            await trx("settings").where({ setting_name: "email_sender" }).update({ setting_value: { sender: newSettings.sender } });
            await trx("settings").where({ setting_name: "email_user" }).update({ setting_value: { user: newSettings.user }});
            await trx("settings").where({ setting_name: "email_host" }).update({ setting_value: { host: newSettings.host }});
            await trx("settings").where({ setting_name: "email_port" }).update({ setting_value: { port: newSettings.port }});
            await trx("settings").where({ setting_name: "email_secure" }).update({ setting_value: { secure: newSettings.secure }});
            await trx("settings").where({ setting_name: "email_shouldsend" }).update({ setting_value: { shouldSend: newSettings.shouldSend }});
            if (newSettings.pass !== undefined && newSettings.pass !== "") {
                await trx("settings").where({ setting_name: "email_pass" }).update({ setting_value: { pass: newSettings.pass }});
            }
        });
    }
};

module.exports = model;