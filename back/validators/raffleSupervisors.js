const { check, validationResult } = require('express-validator');

const validateRaffleResults  = [
  check('results').exists(),
  check('results.*.supervisor_id')  
    .not()  
    .isEmpty()
    .isInt(),
  check('results.*.range_id')  
    .not()  
    .isEmpty()
    .isInt(),
  check('results.*.date')  
    .not()  
    .isEmpty()
    .isDate(),
];

function handleValidationErrors(request, response, next) {
  const validationErrors = validationResult(request);

  if(validationErrors.isEmpty() === false) {
    return response.status(400).send(validationErrors);
  }

  return next();
}

module.exports = { 
  checkRaffleResults: [...validateRaffleResults, handleValidationErrors]
};
