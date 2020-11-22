const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));
const validators = require(path.join(root, 'validators'));

const serviceCalls = {
  readWeek: async function readScheduleWeek(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.daterange.readWeek(query, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  },

  readFreeform: async function readFreeform(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.daterange.readFreeform(query, []);
    }
    catch(e) {
      return next(e);
    }

    return next();
  },
};

exports.readWeek = [
  validators.daterange.readWeek,
  serviceCalls.readWeek
]

exports.readFreeform = [
  validators.daterange.readFreeform,
  serviceCalls.readFreeform
]
