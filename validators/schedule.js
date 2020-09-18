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

function supervisorValidator(requestObject, opts) {
  const validator = requestObject('supervisor_id')
  return supplement(validator, opts)
}

function timeValidator(requestObject, opts, name) {
  const validator = requestObject(name)
    .custom(value => {
      if(moment(value, 'HH:mm', true /* strict parsing */).isValid()) {
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
    idValidator(validate.body, { exists: true }, 'range_reservation_id'),
    supervisorValidator(validate.body, { optional: true }),
    timeValidator(validate.body, { exists: true }, 'open'),
    timeValidator(validate.body, { exists: true }, 'close'),
    handleValidationErrors,
    storeRequest
  ],
  read: [
    idValidator(validate.query, { optional: true }, 'id'),
    idValidator(validate.query, { optional: true }, 'range_reservation_id'),
    supervisorValidator(validate.query, { optional: true }),
    timeValidator(validate.query, { optional: true }, 'open'),
    timeValidator(validate.query, { optional: true }, 'close'),
    handleValidationErrors,
    storeRequest
  ],
  readStrict: [
    idValidator(validate.param, { exists: true }, 'id'),
    handleValidationErrors,
    storeRequest
  ],
  update: [
    idValidator(validate.param, { exists: true }, 'id'),
    idValidator(validate.body, { optional: true }, 'range_reservation_id'),
    supervisorValidator(validate.body, { optional: true }),
    timeValidator(validate.body, { optional: true }, 'open'),
    timeValidator(validate.body, { optional: true}, 'close'),
    handleValidationErrors,
    storeRequest
  ],
  delete: [
    idValidator(validate.param, { exists: true }, 'id'),
    handleValidationErrors,
    storeRequest
  ]
}
