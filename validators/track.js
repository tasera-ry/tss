const { body
        , query
        , param
        , validationResult
        , matchedData } = require('express-validator')

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

  return validator
}

const fields = {
  id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('id')
          .isInt()
          .withMessage('must be an integer')
          .toInt()

    return validatorAdditions(validator, opts)
  }

  , name: function nameValidation(requestObject, ...opts) {
    const validator = requestObject('name')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 255 })
          .withMessage('must be between 1 and 255 characters')
    return validatorAdditions(validator, opts)
  }

  , description: function descriptionValidation(requestObject, ...opts) {
    const validator = requestObject('description')
          .isString()
          .withMessage('must be a string')
          .isLength({ min: 1, max: 255 })
          .withMessage('must be between 1 and 255 characters')
    return validatorAdditions(validator, opts)
  }
}

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request)
  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors)
  }
  return next()
}

module.exports = {
  read: [
    fields.id(param, 'exists')
    , handleValidationErrors
    , function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] })
      return next()
    }
  ], create: [
    fields.name(body, 'exists')
    , fields.description(body, 'exists')
    , fields.id(body, 'exists') //TODO check whats happening here used to be range_id
    , handleValidationErrors
    , function storeCreationRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] })
      return next()
    }
  ], update: [
    fields.id(param, 'exists')
    , fields.name(body, 'optional')
    , fields.description(body, 'optional')
    , handleValidationErrors
    , function storeUpdateRequest(request, response, next) {
      response.locals.id = matchedData(request, { locations: ['params'] })
      response.locals.updates = matchedData(request, { locations: ['body'] })
      return next()
    }
  ], delete: [
    fields.id(param, 'exists')
    , function storeDeleteRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] })
      return next()
    }
  ]
}
