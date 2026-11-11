const {
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
  ]
};
