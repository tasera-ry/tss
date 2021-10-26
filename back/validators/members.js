const _ = require('lodash');

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
  user_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('user_id')
      .isInt()
      .withMessage('must be an integer')
      .toInt();

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
  read: [
    fields.user_id(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ],
  readAll: [
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.filtered = !_.isEmpty(request.query);
      response.locals.query = matchedData(request, { locations: ['params', 'query'] });
      return next();
    }
  ]
}