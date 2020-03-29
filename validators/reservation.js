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
      .exists({ checkNull: true })
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
      .exists({ checkNull, true })
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
    return response.status(400).send(validationResult)
  }

  return next()
}

function storeRequest(request, response, next) {
  response.locals.matched = matchedData(request)
}

module.exports = {
  create: [
    rangeValidator(body, { exists: true })
    , dateValidator(body, { exists: true })
    , availabilityValidator(body, { exists: true })
    , storeRequest
  ]
  , read: [
    idValidator(check, { optional: true })
    , rangeValidator(body, { optional: true })
    , dateValidator(body, { optional: true })
    , availabilityValidator(body, { optional: true })
    , storeRequest
  ]
  , update: [
    idValidator(param, { exists: true })
    , rangeValidator(body, { optional: true })
    , dateValidator(body, { optional: true })
    , availabilityValidator(body, { optional: true })
    , storeRequest
  ]
  , delete: [
    idValidator(param, { exists: true })
    , storeRequest
  ]
}
