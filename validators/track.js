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
      .withMessage('must be included')
  }

  if(opts.includes('optional')) {
    validator = validator
      .optional()
  }

  return validator;
}

const fields = {
  track_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('track_id')
          .isInt()
          .withMessage('must be an integer')
          .toInt()

    return validatorAdditions(validator, opts);
  },

  range_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('range_id')
          .isInt()
          .withMessage('must be an integer')
          .toInt()

    return validatorAdditions(validator, opts);
  },

  //TODO sanitize?
  name: function nameValidation(requestObject, ...opts) {
    const validator = requestObject('name')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 255 })
          .withMessage('must be between 1 and 255 characters')

    return validatorAdditions(validator, opts);
  },

  description: function descriptionValidation(requestObject, ...opts) {
    const validator = requestObject('description')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 255 })
          .withMessage('must be between 1 and 255 characters')

    return validatorAdditions(validator, opts);
  }

  , short_description: function shortDescriptionValidation(requestObject, ...opts) {
    const validator = requestObject('short_description')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 25 })
          .withMessage('must be between 1 and 25 characters')

    return validatorAdditions(validator, opts);
  }
}

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
};

module.exports = {
  read: [
    fields.track_id(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ],
  readAll: [
    fields.name(query, 'optional'),
    fields.description(query, 'optional'),
    fields.short_description(query, 'optional'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.filtered = !_.isEmpty(request.query);
      response.locals.query = matchedData(request, { locations: ['params', 'query'] });
      return next();
    }
  ],
  create: [
    fields.name(body, 'exists'),
    fields.description(body, 'exists'),
    fields.short_description(body, 'exists'),
    fields.range_id(body, 'exists'),
    handleValidationErrors,
    function storeCreationRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    }
  ],
  update: [
    fields.track_id(param, 'exists'),
    fields.name(body, 'optional'),
    fields.description(body, 'optional'),
    fields.short_description(body, 'optional'),
    handleValidationErrors,
    function storeUpdateRequest(request, response, next) {
      response.locals.id = matchedData(request, { locations: ['params'] });
      response.locals.updates = matchedData(request, { locations: ['body'] });
      return next();
    }
  ],
  delete: [
    fields.track_id(param, 'exists'),
    handleValidationErrors,
    function storeDeleteRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ]
}
