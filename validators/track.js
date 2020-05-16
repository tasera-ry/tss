const _ = require('lodash');

const { body
        , query
        , param
        , validationResult
        , matchedData } = require('express-validator');

function validatorAdditions(validator, opts) {
  console.log("VAL TRACK PARAM CHECKS");
  
  if(opts.includes('exists')) {
    console.log("VAL TRACK PARAM EXISTS");
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included')
  }

  if(opts.includes('optional')) {
    console.log("VAL TRACK PARAM OPTIONAL");
    validator = validator
      .optional()
  }

  return validator;
}

const fields = {
  track_id: function idValidation(requestObject, ...opts) {
    console.log("VAL TRACK: id");
    const validator = requestObject('track_id')
          .isInt()
          .withMessage('must be an integer')
          .toInt()

    return validatorAdditions(validator, opts);
  }

  , range_id: function idValidation(requestObject, ...opts) {
    console.log("VAL TRACK: id");
    const validator = requestObject('range_id')
          .isInt()
          .withMessage('must be an integer')
          .toInt()

    return validatorAdditions(validator, opts);
  }

  //TODO sanitize?
  , name: function nameValidation(requestObject, ...opts) {
    console.log("VAL TRACK: name");
    const validator = requestObject('name')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 255 })
          .withMessage('must be between 1 and 255 characters')

    return validatorAdditions(validator, opts);
  }

  , description: function descriptionValidation(requestObject, ...opts) {
    console.log("VAL TRACK: description");
    const validator = requestObject('description')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 255 })
          .withMessage('must be between 1 and 255 characters')

    return validatorAdditions(validator, opts);
  }
}

function handleValidationErrors(request, response, next) {
  console.log("VAL ERRORS");
  const validationErrors = validationResult(request);
  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }
  return next();
};

module.exports = {
  read: [
    fields.track_id(param, 'exists')
    , handleValidationErrors
    , function storeID(request, response, next) {
      console.log("VAL EXPORTS STORE: id");
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ],  readAll: [
    fields.name(query, 'optional')
    , fields.description(query, 'optional')
    , handleValidationErrors
    ,  function storeID(request, response, next) {
      console.log("VAL EXPORTS STORE: id");
      response.locals.filtered = !_.isEmpty(request.query);
      response.locals.query = matchedData(request, { locations: ['params', 'query'] });
      return next();
    }
  ],  create: [
    fields.name(body, 'exists')
    , fields.description(body, 'exists')
    , fields.range_id(body, 'exists')
    , handleValidationErrors
    , function storeCreationRequest(request, response, next) {
      console.log("VAL EXPORTS STORE: name");
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    }
  ], update: [
    fields.track_id(param, 'exists')
    , fields.name(body, 'optional')
    , fields.description(body, 'optional')
    , handleValidationErrors
    , function storeUpdateRequest(request, response, next) {
      console.log("VAL EXPORTS STORE: update request");
      response.locals.id = matchedData(request, { locations: ['params'] });
      response.locals.updates = matchedData(request, { locations: ['body'] });
      return next();
    }
  ], delete: [
    fields.track_id(param, 'exists')
    , function storeDeleteRequest(request, response, next) {
      console.log("VAL EXPORTS STORE: delete request");
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ]
}
