const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const validators = require(path.join(root, 'validators'));

const serviceCalls = {
  read: async function readScheduleWeek(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.weekview.read(query, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  }
};

exports.read = [
  validators.weekview.read,
  serviceCalls.read
]
