const {
  body,
  query,
  param,
  validationResult,
  matchedData
} = require('express-validator');

function validatorAdditions(validator, opts) {
  if(opts.includes('exists')) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included');
  }

  if(opts.includes('optional')) {
    validator = validator
      .optional();
  }

  return validator;
}

const fields = {
  begin: function beginDayValidation(requestObject, ...opts) {
    const validator = requestObject('begin')
      .isDate()
      .withMessage('must be a date')

    return validatorAdditions(validator, opts);
  },
};

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

module.exports = {
  read: [
    fields.begin(param, 'exists'),
    handleValidationErrors,
    function storeDate(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ],
};
