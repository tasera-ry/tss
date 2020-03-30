const validate = require('express-validator')
const moment = require('moment')

function supplement(validator, opts) {
  if(opts.exists) {
    return validator
      .exists()
  }

  if(opts.optional) {
    return validator
      .optional()
  }
  return validator
}

function idValidator(requestObject, opts, name) {
  const validator = requestObject(name)
      .isInt('must be an integer')
      .withMessage('must be an integer')
      .toInt()

  return supplement(validator, opts)
}

function timeValidator(requestObject, opts, name) {
  const validator = requestObject(name)
        .custom(value => {
          if(moment(value, 'HH:mm').isValid()) {
            return true
          }
          throw Error('Time is not in a valid format (HH:mm)')
        })
  return supplement(validator, opts)
}

function handleValidationErrors(request, response, next) {
  const validationErrors = validate.validationResult(request)
  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors)
  }

  return next()
}

function storeRequest(request, response, next) {
  response.locals.matched = validate.matchedData(request)
  return next()
}

module.exports = {
  create: [
    idValidator(validate.body, { optional: true }, 'id')
    , idValidator(validate.body, { exists: true }, 'range_reservation_id')
    , idValidator(validate.body, { optional: true }, 'supervisor_id')
    , timeValidator(validate.body, { exists: true }, 'open')
    , timeValidator(validate.body, { exists: true }, 'close')
    , handleValidationErrors
    , storeRequest
  ]
  , read: [
    idValidator(validate.query, { optional: true }, 'id')
    , idValidator(validate.query, { optional: true }, 'range_reservation_id')
    , idValidator(validate.query, { optional: true }, 'supervisor_id')
    , timeValidator(validate.query, { optional: true }, 'open')
    , timeValidator(validate.query, { optional: true }, 'close')
    , handleValidationErrors
    , storeRequest
  ]
  , readStrict: [
    idValidator(validate.param, { exists: true }, 'id')
    , handleValidationErrors
    , storeRequest
  ]
  , update: [
    idValidator(validate.param, { exists: true }, 'id')
    , idValidator(validate.body, { optional: true }, 'range_reservation_id')
    , idValidator(validate.body, { optional: true }, 'supervisor_id')
    , timeValidator(validate.body, { optional: true }, 'open')
    , timeValidator(validate.body, { optional: true}, 'close')
    , handleValidationErrors
    , storeRequest
  ]
  , delete: [
    idValidator(validate.param, { exists: true }, 'id')
    , handleValidationErrors
    , storeRequest
  ]
}
