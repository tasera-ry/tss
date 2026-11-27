const { body, validationResult, matchedData } = require('express-validator');

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);
  if (validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }
  return next();
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
// Postgres int4: larger values would reach the database and fail there.
const INT4 = 2147483647;

const time = field => field.matches(TIME).withMessage('must be a time, HH:MM');

function storeBody(request, response, next) {
  const data = matchedData(request, { locations: ['body'] });
  // matchedData drops an explicit null, which is how a client clears the shift.
  if (request.body && request.body.association_id === null) data.association_id = null;
  response.locals.body = data;
  return next();
}

module.exports = {
  write: [
    body('dates')
      .isArray({ min: 1, max: 366 })
      .withMessage('must be a list of 1 to 366 dates'),
    body('dates.*')
      .isDate({ format: 'YYYY-MM-DD', strictMode: true })
      .withMessage('must be a date, YYYY-MM-DD'),
    body('available').optional().isBoolean({ strict: true }).withMessage('must be true or false'),
    time(body('open').optional()),
    time(body('close').optional()),
    body('association_id')
      .optional({ nullable: true })
      .isInt({ min: 1, max: INT4 })
      .withMessage('must be an id')
      .toInt(),
    handleValidationErrors,
    storeBody
  ]
};
