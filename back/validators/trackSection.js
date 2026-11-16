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
  ]
};
