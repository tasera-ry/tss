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

  , password: function passwordValidation(requestObject, ...opts) {
    const validator = requestObject('password')
          .isString()
          .withMessage('must be a string')
          .isAscii('must only contain ASCII characters')
          .isByteLength({ min: 6, max: 72 })
          .withMessage('must be between 6 and 72 characters')

    return validatorAdditions(validator, opts)
  }

  , role: function roleValidation(requestObject, ...opts) {
    const validator = requestObject('role')
          .isString()
          .withMessage('must be a string')
          .isIn(['superuser', 'supervisor'])
          .withMessage('must be a superuser or supervisor')

    return validatorAdditions(validator, opts)
  }

  , phone: function phoneValidation(requestObject, ...opts) {
    const validator = requestObject('phone')
          .isString().withMessage('must be a string')
          .isMobilePhone().withMessage('has to be a mobile number')
    return validatorAdditions(validator, opts)
  }
  
}

exports.queryJWTUserInfo = async function queryJWT(request, response, next) {
  if(request.locals === undefined) {
    request.locals = {}
  }
  const users = await services.user.read(request.user)

  if(users.length !== 1) {
    return response.status(500).send({
      error: 'Authorization token didn\'t identify a user'
    })
  }
  
  request.locals.user = users.pop()
  return next()
}

exports.handleValidationErrors = function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request)
  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors)
  }
  return next()
}

exports.requesterHasProperty = function userHasProperty(propertyName, value, equalityFn) {
  function propertyEquals(obj) {
    return equalityFn === undefined
      ? obj[propertyName] === value
      : equalityFn(obj[propertyName], value)
  }

  return function(request, response, next) {
    if(propertyEquals(request.locals.user)) {
      return next()
    }
    return response.status(403).send({
      error: 'User doesn\'t have privileges to this resource'
    })
  }
}
