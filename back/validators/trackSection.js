const {
  body,
  param,
  query,
  validationResult,
  matchedData
} = require('express-validator');

// Postgres int4: larger values would reach the database and fail there.
const INT4 = 2147483647;

const id = field => field
  .isInt({ min: 1, max: INT4 })
  .withMessage('must be an id')
  .toInt();
// Counted in characters as varchar(255) counts them.
const text = (field, min) => field
  .isString()
  .withMessage('must be text')
  .trim()
  .custom(value => [...value].length >= min && [...value].length <= 255)
  .withMessage(`must be ${min} to 255 characters`);
const lanes = field => field
  .isInt({ min: 1, max: 1000 })
  .withMessage('must be a whole number of lanes, 1 to 1000')
  .toInt();

function storeBody(request, response, next) {
  response.locals.body = matchedData(request, { locations: ['body'] });
  return next();
}

function storeId(request, response, next) {
  response.locals.id = matchedData(request, { locations: ['params'] }).id;
  return next();
}

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

module.exports = {
  readFilter: [
    query('track_id')
      .optional()
      .isInt()
      .withMessage('must be an integer')
      .toInt(),
    handleValidationErrors,
    function storeQuery(request, response, next) {
      response.locals.query = matchedData(request, { locations: ['query'] });
      return next();
    }
  ],

  create: [
    id(body('track_id')),
    text(body('name'), 1),
    lanes(body('lane_count')),
    text(body('description').optional(), 0),
    handleValidationErrors,
    storeBody
  ],

  update: [
    id(param('id')),
    text(body('name').optional(), 1),
    lanes(body('lane_count').optional()),
    text(body('description').optional(), 0),
    handleValidationErrors,
    storeId,
    storeBody
  ],

  delete: [
    id(param('id')),
    handleValidationErrors,
    storeId
  ]
};
