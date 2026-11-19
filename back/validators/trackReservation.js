const {
  body,
  param,
  query,
  validationResult,
  matchedData
} = require('express-validator');

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const TYPES = ['private_event', 'official', 'closed'];
// A track's status for the day; 'present' is the tablet's to set.
const SUPERVISION = ['absent', 'closed', 'private_event'];

// Postgres int4: larger values would reach the database and fail there.
const INT4 = 2147483647;

const date = field => field
  .isDate({ format: 'YYYY-MM-DD', strictMode: true })
  .withMessage('must be a date, YYYY-MM-DD');
const time = field => field.matches(TIME).withMessage('must be a time, HH:MM');
const id = field => field
  .isInt({ min: 1, max: INT4 })
  .withMessage('must be an id')
  .toInt();
const lanes = field => field
  .isInt({ min: 1, max: INT4 })
  .withMessage('must be a whole number of lanes, at least 1')
  .toInt();
// Counted in characters as varchar(255) counts them; NUL is refused, as
// Postgres refuses it in text.
const description = field => field
  .isString()
  .withMessage('must be text')
  .trim()
  .custom(value => [...value].length <= 255)
  .withMessage('must be at most 255 characters')
  .custom(value => !value.includes('\u0000'))
  .withMessage('must not contain NUL');

function storeBody(request, response, next) {
  const body = matchedData(request, { locations: ['body'] });
  // matchedData drops an explicit null, which is how a client clears these.
  for (const field of ['association_id', 'description']) {
    if (request.body && request.body[field] === null) body[field] = null;
  }
  response.locals.body = body;
  return next();
}

function storeId(request, response, next) {
  response.locals.id = matchedData(request, { locations: ['params'] }).id;
  return next();
}

module.exports = {
  // A date is required: without one this would return every reservation ever
  // made.
  readFilter: [
    query('date')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('must be included')
      .isDate({ format: 'YYYY-MM-DD', strictMode: true })
      .withMessage('must be a date, YYYY-MM-DD'),
    query('track_section_id')
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

  // Official use needs no lanes: it always takes the whole track.
  create: [
    date(body('date').exists().withMessage('must be included')),
    time(body('start_time').exists().withMessage('must be included')),
    time(body('end_time').exists().withMessage('must be included')),
    body('type').isIn(TYPES).withMessage(`must be one of ${TYPES.join(', ')}`),
    id(body('track_section_id').exists().withMessage('must be included')),
    lanes(body('lanes_used')
      .if(body('type').not().equals('official'))
      .exists()
      .withMessage('must be included')),
    id(body('association_id').optional({ nullable: true })),
    description(body('description').optional({ nullable: true })),
    handleValidationErrors,
    storeBody
  ],

  // Any subset of the fields; the type cannot change (delete and create).
  update: [
    id(param('id')),
    body('type').optional().isIn(TYPES).withMessage(`must be one of ${TYPES.join(', ')}`),
    date(body('date').optional()),
    time(body('start_time').optional()),
    time(body('end_time').optional()),
    lanes(body('lanes_used').optional()),
    id(body('track_section_id').optional()),
    id(body('association_id').optional({ nullable: true })),
    description(body('description').optional({ nullable: true })),
    handleValidationErrors,
    storeBody,
    storeId
  ],

  // A track's day copied to other days: any of its status, notice and
  // bookings. The service checks the bookings against the track.
  copy: [
    id(body('track_id').exists().withMessage('must be included')),
    body('dates')
      .isArray({ min: 1, max: 366 })
      .withMessage('must be a list of 1 to 366 dates'),
    date(body('dates.*')),
    body('track_supervisor')
      .optional()
      .isIn(SUPERVISION)
      .withMessage(`must be one of ${SUPERVISION.join(', ')}`),
    description(body('notice').optional()),
    body('reservations')
      .optional()
      .isArray({ max: 100 })
      .withMessage('must be a list of at most 100 bookings'),
    body('reservations.*.type').isIn(TYPES).withMessage(`must be one of ${TYPES.join(', ')}`),
    time(body('reservations.*.start_time')),
    time(body('reservations.*.end_time')),
    id(body('reservations.*.track_section_id').optional()),
    lanes(body('reservations.*.lanes_used').optional()),
    id(body('reservations.*.association_id').optional({ nullable: true })),
    description(body('reservations.*.description').optional({ nullable: true })),
    handleValidationErrors,
    storeBody
  ],

  delete: [
    id(param('id')),
    handleValidationErrors,
    storeId
  ]
};
