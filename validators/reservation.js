const { body
        , check
        , query
        , param
        , validationResult
        , matchedData } = require('express-validator')

function idValidator(requestObject, opts) {

  let validator = requestObject('id')
      .isInt()
      .withMessage('must be an integer')
      .toInt()

  if(opts.exists) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included')
  }

  if(opts.optional) {
    validator = validator
      .optional()
  }
  return validator
}

function rangeValidator(requestObject, opts) {
  let validator = requestObject('range_id')
      .isInt()
      .withMessage('must be an integer')
      .toInt()

  if(opts.exists) {
    validator = validator
      .exists({ checkNull: true })
  }

  if(opts.optional) {
    validator = validator
      .optional()
  }
  return validator
}

function dateValidator(requestObject, opts) {
  let validator = requestObject('date')
      .isISO8601({ strict: true })
      .withMessage('must be an ISO8601 date')

  if(opts.exists) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included')
  }

  if(opts.optional) {
    validator = validator
      .optional()
  }
  return validator
}

function fromValidator(requestObject, opts) {
  let validator = requestObject('from')
      .isISO8601({ strict: true })
      .withMessage('must be an ISO8601 date')
  
  if(opts.exists) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included')
  }

  if(opts.optional) {
    validator = validator
      .optional()
  }
  return validator
}

function toValidator(requestObject, opts) {
  let validator = requestObject('to')
      .isISO8601({ strict: true })
      .withMessage('must be an ISO8601 date')
  
  if(opts.exists) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included')
  }

  if(opts.optional) {
    validator = validator
      .optional()
  }
  return validator
}

function availabilityValidator(requestObject, opts) {
  let validator = requestObject('available')
      .isBoolean()
      .withMessage('must be a boolean')
        .toBoolean(true /* strict mode */)

  if(opts.exists) {
    validator = validator
      .exists({ checkNull: true })
      .withMessage('must be included')
  }

  if(opts.optional) {
    validator = validator
      .optional()
  }
  return validator
}

/*
 * code duplication between validators :(, someone please fix
 */
function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request)
  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors)
  }

  return next()
}

function storeRequest(request, response, next) {
  response.locals.matched = matchedData(request)
  return next()
}

module.exports = {
  create: [
    rangeValidator(body, { exists: true })
    , dateValidator(body, { exists: true })
    , availabilityValidator(body, { exists: true })
    , handleValidationErrors
    , storeRequest
  ]
  , read: [
    idValidator(query, { optional: true })
    , rangeValidator(query, { optional: true })
    , dateValidator(query, { optional: true })
    , availabilityValidator(query, { optional: true })
    , fromValidator(query, { optional: true })
    , toValidator(query, { optional: true })
    , handleValidationErrors
    , storeRequest
  ]
  , readStrict: [
    idValidator(param, { exists: true })
    , handleValidationErrors
    , storeRequest
  ]
  , update: [
    idValidator(param, { exists: true })
    , rangeValidator(body, { optional: true })
    , dateValidator(body, { optional: true })
    , availabilityValidator(body, { optional: true })
    , handleValidationErrors
    , storeRequest
  ]
  , delete: [
    idValidator(param, { exists: true })
    , handleValidationErrors
    , storeRequest
  ]
}
