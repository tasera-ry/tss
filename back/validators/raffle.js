//const _ = require('lodash');

const {
  body,
  //query,
  //param,
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
  range_id: function range_idValidation(requestObject, ...opts) {
    const validator = requestObject('range_id')
      .isInt()
      .withMessage('must be an int')
      .toInt();

    return validatorAdditions(validator, opts);
  },
  dates: function datesValidation(requestObject, ...opts) {
    // validate each string in list with wildcard *
    const validator = requestObject('dates.*')
      .isString()
      .withMessage('must be a string date')
      .isDate()
      .withMessage('must be a date');

    return validatorAdditions(validator, opts);
  }
};

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

module.exports = {
  create: [
    fields.range_id(body, 'optional'),
    fields.dates(body, 'exists'),
    handleValidationErrors,
    function storeUpdateRequest(request, response, next) {
      response.locals.body = matchedData(request, { locations: ['body'] });
      return next();
    }
  ]
};
