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
  scheduled_range_supervision_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('scheduled_range_supervision_id')
      .isInt()
      .withMessage('must be an integer')
      .toInt();

    return validatorAdditions(validator, opts);
  },

  track_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('track_id')
      .isInt()
      .withMessage('must be an integer')
      .toInt();

    return validatorAdditions(validator, opts);
  },

  track_supervisor: function supervisorValidation(requestObject, ...opts) {
    const validator = requestObject('track_supervisor')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('must be between 1 and 255 characters');
    return validatorAdditions(validator, opts);
  },

  notice: function noticeValidation(requestObject, ...opts) {
    const validator = requestObject('notice')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 0, max: 255 })
      .withMessage('must be between 0 and 255 characters');
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
  readFilter: [
    fields.track_supervisor(query, 'optional'),
    fields.notice(query, 'optional'),
    fields.scheduled_range_supervision_id(query, 'optional'),
    handleValidationErrors,
    function storeQuery(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['query'] });
      return next();
    }
  ],
  read: [
    fields.scheduled_range_supervision_id(param, 'exists'),
    fields.track_id(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ],
  create: [
    fields.scheduled_range_supervision_id(body, 'exists'),
    fields.track_id(body, 'exists'),
    fields.track_supervisor(body, 'exists'),
    fields.notice(body, 'optional'),
    handleValidationErrors,
    function storeCreationRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    }
  ],
  update: [
    fields.scheduled_range_supervision_id(param, 'exists'),
    fields.track_id(param, 'exists'),
    fields.track_supervisor(body, 'optional'),
    fields.notice(body, 'optional'),
    handleValidationErrors,
    function storeUpdateRequest(request, response, next) {
      response.locals.id = matchedData(request, { locations: ['params'] });
      response.locals.updates = matchedData(request, { locations: ['body'] });
      return next();
    }
  ],
  delete: [
    fields.scheduled_range_supervision_id(param, 'exists'),
    fields.track_id(param, 'exists'),
    handleValidationErrors,
    function storeDeleteRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    }
  ]
};
