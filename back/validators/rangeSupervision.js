const {
  body,
  query,
  param,
  validationResult,
  matchedData,
} = require('express-validator');
const moment = require('moment');

function validatorAdditions(validator, opts) {
  if (opts.includes('exists')) {
    validator = validator
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included');
  }

  if (opts.includes('optional')) {
    validator = validator.optional({ nullable: true });
  }

  return validator;
}

const fields = {
  scheduled_range_supervision_id: function idValidation(
    requestObject,
    ...opts
  ) {
    const validator = requestObject('scheduled_range_supervision_id')
      .isInt()
      .withMessage('must be an integer')
      .toInt();
    return validatorAdditions(validator, opts);
  },

  range_supervisor: function supervisorValidation(requestObject, ...opts) {
    const validator = requestObject('range_supervisor')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('must be between 1 and 255 characters');
    return validatorAdditions(validator, opts);
  },

  association: function supervisorValidation(requestObject, ...opts) {
    const validator = requestObject('association')
      .isInt()
      .withMessage('must be an integer')
      .toInt();
    return validatorAdditions(validator, opts);
  },

  notice: function noticeValidation(requestObject, ...opts) {
    const validator = requestObject('notice')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('must be between 1 and 255 characters');
    return validatorAdditions(validator, opts);
  },

  user_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('id')
      .isInt()
      .withMessage('must be an integer')
      .toInt();
    return validatorAdditions(validator, opts);
  },

  feedback: function feedbackValidation(requestObject, ...opts) {
    const validator = requestObject('feedback')
      .isString()
      .withMessage('must be a string')
      .isLength({ min: 1 })
      .withMessage('must be at least one character long');
    return validatorAdditions(validator, opts);
  },

  user: function userValidation(requestObject, ...opts) {
    const validator = requestObject('user')
      .isString()
      .withMessage('must be a string');
    return validatorAdditions(validator, opts);
  },

  arriving_at: function timeValidator(requestObject, ...opts) {
    const validator = requestObject('arriving_at').custom((value) => {
      if (moment(value, 'HH:mm:ss', true /* strict parsing */).isValid()) {
        return true;
      }
      throw Error('Time is not in a valid format (HH:mm:ss)');
    });

    return validatorAdditions(validator, opts);
  },

  rangeofficer_id: function idValidation(requestObject, ...opts) {
    const validator = requestObject('rangeofficer_id').optional({
      nullable: true,
    });
    // .withMessage('must be an integer')
    // .toInt();
    return validatorAdditions(validator, opts);
  },
};

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if (validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

// probably needs const strings
module.exports = {
  readFilter: [
    fields.range_supervisor(query, 'optional'),
    fields.notice(query, 'optional'),
    fields.scheduled_range_supervision_id(query, 'optional'),
    handleValidationErrors,
    function storeQuery(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['query'] });
      return next();
    },
  ],
  read: [
    fields.scheduled_range_supervision_id(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    },
  ],
  userSupervisions: [
    fields.user_id(param, 'exists'),
    handleValidationErrors,
    function storeUserID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    },
  ],
  associationSupervisions: [
    fields.association(param, 'exists'),
    handleValidationErrors,
    function storeID(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    },
  ],
  feedback: [
    fields.feedback(body, 'exists'),
    fields.user(body, 'exists'),
    handleValidationErrors,
    function storeFeedback(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    },
  ],
  create: [
    fields.scheduled_range_supervision_id(body, 'exists'),
    fields.range_supervisor(body, 'exists'),
    fields.notice(body, 'optional'),
    handleValidationErrors,
    function storeCreationRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['body'] });
      return next();
    },
  ],
  update: [
    fields.scheduled_range_supervision_id(param, 'exists'),
    fields.range_supervisor(body, 'optional'),
    fields.association(body, 'optional'),
    fields.notice(body, 'optional'),
    fields.arriving_at(body, 'optional'),
    fields.rangeofficer_id(body, 'optional'),
    handleValidationErrors,
    function storeUpdateRequest(request, response, next) {
      response.locals.id = matchedData(request, { locations: ['params'] });
      response.locals.updates = matchedData(request, {
        locations: ['body'],
        includeOptionals: true,
      });
      return next();
    },
  ],
  delete: [
    fields.scheduled_range_supervision_id(param, 'exists'),
    handleValidationErrors,
    function storeDeleteRequest(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['params'] });
      return next();
    },
  ],
};
