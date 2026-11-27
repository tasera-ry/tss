const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

module.exports = {
  write: async function writeRangeDays(request, response, next) {
    try {
      response.locals.days = await services.rangeDay.write(response.locals.body);
    } catch (error) {
      // Data the database could not take (SQLSTATE class 22): never echo its text.
      if (/^22/.test(error.code || '')) {
        return response.status(400).send({ success: false, message: 'Invalid value' });
      }
      if (error.status) {
        return response.status(error.status).send({ success: false, message: error.message });
      }
      return next(error);
    }
    return next();
  }
};
