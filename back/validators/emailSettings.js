const { checkSchema, validationResult, matchedData } = require('express-validator');

const emailSettingConstraints = {
    sender: {in: ["body"], exists: true, isEmail: true, normalizeEmail: true, errorMessage: "Invalid sender email"},
    user: {in: ["body"]},
    pass: {in: ["body"]},
    host: {in: ["body"], exists: true, isURL: true, errorMessage: "Invalid host address"},
    port: {in: ["body"], exists: true, isInt: true, errorMessage: "Invalid port"},
    secure: {in: ["body"], exists: true},
    shouldSend: {in: ["body"], exists: true}
};

function handleValidationErrors(request, response, next) {
    const validationErrors = validationResult(request);
    if (validationErrors.isEmpty() === false) {
        return response.status(400).send(validationErrors);
    }
    request.body = matchedData(request, { locations: ['body'], includeOptionals: true });
    return next();
}

module.exports = {
    update: [checkSchema(emailSettingConstraints), handleValidationErrors]
};