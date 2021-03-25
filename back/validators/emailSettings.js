const { checkSchema, validationResult, matchedData } = require('express-validator');

/* Returns a custom validation function for the email messages */
const checkEmailMessage = (allowedVars) => {
  return (value, _) => {
    return new Promise((resolve, reject) => {
      const matches = value.match(/{(.*?)}/g) || [];
      matches.forEach(match => {
        console.log(match);
        if (!allowedVars.includes(match)) {
          return reject();
        }
      });
      return resolve();
    });
  };
};

/*
 This object contains the constraints that the received data is checked against.
 Edit this if you want to change what is and isn't accepted. See https://express-validator.github.io/docs/schema-validation.html for info about the syntax.
*/
const emailSettingConstraints = {
  sender: {in: ["body"], exists: true, isEmail: true, normalizeEmail: true, errorMessage: "Invalid sender email"},
  user: {in: ["body"]},
  pass: {in: ["body"]},
  host: {in: ["body"], exists: true, isURL: true, errorMessage: "Invalid host address"},
  port: {in: ["body"], exists: true, isInt: true, errorMessage: "Invalid port"},
  secure: {in: ["body"], exists: true},
  shouldSend: {in: ["body"], exists: true},
  assignedMsg: {in: ["body"], custom: {options: checkEmailMessage([])}},
  updateMsg: {in: ["body"], custom: {options: checkEmailMessage([])}},
  reminderMsg: {in: ["body"], custom: {options: checkEmailMessage([])}},
  declineMsg: {in: ["body"], custom: {options: checkEmailMessage(["{date}", "{user}"])}},
  feedbackMsg: {in: ["body"], custom: {options: checkEmailMessage(["{feedback}", "{user}"])}}
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