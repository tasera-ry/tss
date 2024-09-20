const _ = require('lodash');

const { body, query, param, validationResult, matchedData } = require('express-validator');

function validatorAdditions(validator, opts) {
  if (opts.includes('exists')) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included');
  }

  if (opts.includes('optional')) {
    validator = validator.optional();
  }

  return validator;
}

const fields = {
  id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('id').isInt().withMessage('must be an integer').toInt();

    return validatorAdditions(validator, opts);
  },

  device_name: function deviceNameValidation(requestObject, ...opts) {
    const validator = requestObject('device_name')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('must be between 1 and 255 characters');

    return validatorAdditions(validator, opts);
  },

  status: function statusValidation(requestObject, ...opts) {
    const validator = requestObject('status')
      .isString()
      .withMessage('must be a string')
      .isIn(['free', 'reserved'])
      .withMessage('must be either "free" or "reserved"');

    return validatorAdditions(validator, opts);
  },
};

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if (validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

module.exports = {
  read: [
    fields.id(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    },
  ],
  readAll: [
    fields.device_name(query, 'optional'),
    fields.status(query, 'optional'),
    handleValidationErrors,
    function storeQuery(request, response, next) {
      response.locals.filtered = !_.isEmpty(request.query);
      response.locals.query = matchedData(request, {
        locations: ['params', 'query'],
      });
      return next();
    },
  ],
  create: [
    fields.device_name(body, 'exists'),
    fields.status(body, 'exists'),
    handleValidationErrors,
    function storeCreationRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    },
  ],
  update: [
    fields.id(param, 'exists'),
    fields.device_name(body, 'optional'),
    fields.status(body, 'optional'),
    handleValidationErrors,
    function storeUpdateRequest(request, response, next) {
      response.locals.id = matchedData(request, { locations: ['params'] });
      response.locals.updates = matchedData(request, { locations: ['body'] });
      return next();
    },
  ],
  delete: [
    fields.id(param, 'exists'),
    handleValidationErrors,
    function storeDeleteRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    },
  ],
};
