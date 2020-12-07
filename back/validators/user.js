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
      .withMessage('must be included');
  }

  if(opts.includes('optional')) {
    validator = validator
      .optional();
  }

  return validator;
}

const fields = {
  id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('id')
      .isInt()
      .withMessage('must be an integer')
      .toInt();

    return validatorAdditions(validator, opts);
  },

  name: function nameValidation(requestObject, ...opts) {
    const validator = requestObject('name')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('must be between 1 and 255 characters');
    return validatorAdditions(validator, opts);
  },

  password: function passwordValidation(requestObject, ...opts) {
    const validator = requestObject('password')
      .isString()
      .withMessage('must be a string')
      .isAscii('must only contain ASCII characters')
      .isByteLength({ min: 6, max: 72 })
      .withMessage('must be between 6 and 72 characters');
    return validatorAdditions(validator, opts);
  },

  role: function roleValidation(requestObject, ...opts) {
    const validator = requestObject('role')
      .isString()
      .withMessage('must be a string')
      .isIn(['superuser', 'supervisor'])
      .withMessage('must be a superuser or supervisor');
    return validatorAdditions(validator, opts);
  },
    email: function emailValidation(requestObject, ...opts) {
    const validator = requestObject('email')
      .isString()
      .withMessage('must be a string')
      .isByteLength({ min: 6, max: 144 })
      .withMessage('must be between 6 and 144 characters');
    return validatorAdditions(validator, opts);
  },

  phone: function phoneValidation(requestObject, ...opts) {
    const validator = requestObject('phone')
      .isString().withMessage('must be a string')
      .isMobilePhone().withMessage('has to be a mobile number');
    return validatorAdditions(validator, opts);
  }
};

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

module.exports = {
  sign: [
    fields.name(body, 'exists'),
    fields.password(body, 'exists'),
    handleValidationErrors,
    function storeCredentials(request, response, next) {
      response.locals.credentials = (
        matchedData(request, { locations: ['body']}));
      return next();
    }
  ],
  readFilter: [
    fields.id(query, 'optional'),
    fields.name(query, 'optional'),
    fields.role(query, 'optional'),
    fields.email(body, 'optional'),
    fields.phone(query, 'optional'),
    handleValidationErrors,
    function storeQuery(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['query'] });
      return next();
    }
  ],
  read: [
    fields.id(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ],
  create: [
    fields.name(body, 'exists'),
    fields.password(body, 'exists'),
    fields.role(body, 'exists'),
    fields.email(body, 'optional'),
    fields.phone(body, 'optional')
      .custom((value, {request}) => request.body.role === 'supervisor')
      .withMessage('may only be assigned to a supervisor'),
    handleValidationErrors,
    function storeCreationRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    }
  ],
  update: [
    fields.id(param, 'exists'),
    fields.name(body, 'optional'),
    fields.password(body, 'optional'),
    fields.email(body, 'optional'),
    fields.phone(body, 'optional'),
    handleValidationErrors,
    function storeUpdateRequest(request, response, next) {
      response.locals.id = matchedData(request, { locations: ['params'] });
      response.locals.updates = matchedData(request, { locations: ['body'] });
      return next();
    }
  ],
  delete: [
    fields.id(param, 'exists'),
    handleValidationErrors,
    function storeDeleteRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ]
};
