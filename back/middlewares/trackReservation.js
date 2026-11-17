const path = require('path');
const root = path.join(__dirname, '..');
const services = require(path.join(root, 'services'));

const serviceCalls = {
  read: async function readReservations(request, response, next) {
    const query = response.locals.query;

    try {
      response.locals.queryResult = await services.trackReservation.read(query);
    }
    catch(e) {
      return next(e);
    }

    return next();
  }
};

module.exports = serviceCalls;
