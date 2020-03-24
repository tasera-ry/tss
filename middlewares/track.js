const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const { validationResult } = require('express-validator')

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

exports.validators = {
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

exports.handleValidationErrors = function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request)
  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors)
  }
  return next()
}