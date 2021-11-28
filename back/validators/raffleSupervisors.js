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
  // Sano henrille et pls tää 2000-01-02 muodossa
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
