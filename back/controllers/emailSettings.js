const { emailSettings } = require('../mailer.js');

const controller = {
    readShouldSend: async function(request, response) {
        const data = {
            sender: emailSettings.sender,
            user: emailSettings.user,
            host: emailSettings.host,
            port: emailSettings.port,
            secure: emailSettings.secure,
            shouldSend: emailSettings.shouldSend
        };
        return response.status(200).send(data);
    },
    updateShouldSend: async function(request, response) {
        const body = request.body;
        const validateEmail = email => {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };

        if (!validateEmail(body.sender)) {
            return response.status(400).send("Invalid email address");
        }

        Object.keys(emailSettings).forEach(key => {
            if (body[key] !== undefined && body[key] !== "")
                emailSettings[key] = body[key];
        });
        return response.status(200).send();
    }
};

module.exports = controller;